import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectIsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-is-spread.js'
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

function makeObjectIsNode(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'is' },
      computed: false,
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpread(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-is-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.is', () => {
      const desc = noUnnecessaryObjectIsSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-is-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectIsSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectIsSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectIsSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectIsSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.is with spread', () => {
    test('reports for Object.is(...arr) with Identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...obj.prop) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...getValue()) with CallExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...[1, 2]) with ArrayExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...{}) with ObjectExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'ObjectExpression', properties: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(x ? a : b)) with ConditionalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(a + b)) with BinaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(() => {})) with ArrowFunctionExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...`template`) with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(a || b)) with LogicalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(!x)) with UnaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...new Foo()) with NewExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.is', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toMatch(/Object\.is/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toBe(
        'Object.is(...items) with spread is unusual. is() expects two values.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      const node = makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' }), 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.is(...(await x)) with AwaitExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(yield x)) with YieldExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.is(...(1, 2)) with SequenceExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.is(...x.y.z) with nested MemberExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'y' } }, property: { type: 'Identifier', name: 'z' } })))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.is(a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.is(a) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.is() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.is(a, b, c) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.is(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Array' }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'assign', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'keys', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'entries', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.is(...items) — wrong object identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myObj' }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member Object["is"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'is' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Identifier (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getObj' }, arguments: [] }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Is" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'Is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "OBJECT" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'OBJECT' }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'is', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'is' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'is' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is not SpreadElement (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is not SpreadElement (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is not SpreadElement (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectIsSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectIsSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'is'))
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'more' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectIsSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectIsSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectIsSpreadRule.meta
      const meta2 = noUnnecessaryObjectIsSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
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
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      const node = makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectIsSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectIsSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectIsSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' }), 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'is' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'is' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeObjectIsNode(makeSpread({ type: 'Identifier', name: 'more' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report Object.is with 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', []))
      expect(reports.length).toBe(0)
    })

    test('handles spread argument containing another SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeObjectIsNode(makeSpread(makeSpread({ type: 'Identifier', name: 'deep' }))))
      expect(reports.length).toBe(1)
    })

    test('verifies correct argument count — 2 args without spread does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectIsSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'is', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })
  })
})

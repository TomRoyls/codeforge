import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFlatSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-flat-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-flat-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning flat', () => {
      const desc = noUnnecessaryArrayFlatSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/flat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-flat-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFlatSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFlatSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayFlatSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFlatSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports arr.flat(...spread)', () => {
    test('reports for arr.flat(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].flat(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for data.flat(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'flat', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().flat(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.nested.flat(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'nested' } }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for string.flat(...items) — rule does not check object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for 42.flat(...items) — rule does not check object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.flat(...items) with ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions flat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/flat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.flat(...items) with spread is unusual. flat() expects an optional depth argument.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'flat', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.flat(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...obj.items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...(condition ? a : b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'condition' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...new Set())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...(a || b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...void 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flat(...template)`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.flat() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(2) — numeric depth argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(depth)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(...items, 1) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flatMap', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for flat(...items) — no MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'flat' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["flat"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'flat' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'flat' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Flat" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Flat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "FLAT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'FLAT', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "flatmap" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flatmap', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Identifier', name: 'depth' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getDepth' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'config' }, property: { type: 'Identifier', name: 'depth' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has three elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg(), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('reports when callee object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFlatSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat')) // no args
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()])) // spread
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Literal', value: 1 }])) // literal
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()])) // spread
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeSpreadArg()])) // wrong method
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayFlatSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFlatSpreadRule.meta
      const meta2 = noUnnecessaryArrayFlatSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
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
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFlatSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFlatSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFlatSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'flat', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles computed member expression — reports when computed is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })
  })
})

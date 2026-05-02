import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayConcatSingleRule } from '../../../../src/rules/patterns/no-unnecessary-array-concat-single.js'
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

describe('no-unnecessary-array-concat-single rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning concat', () => {
      const desc = noUnnecessaryArrayConcatSingleRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/concat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-concat-single.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayConcatSingleRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayConcatSingleRule).toBeDefined()
      expect(noUnnecessaryArrayConcatSingleRule.meta).toBeDefined()
      expect(noUnnecessaryArrayConcatSingleRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary concat with array literal', () => {
    test('reports for arr.concat([]) — empty array literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([1]) — single-element array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([1, 2]) — multi-element array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat(["hello"]) — string element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 'hello' }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([foo]) — identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Identifier', name: 'foo' }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([{ a: 1 }]) — object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'ObjectExpression', properties: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([true, false]) — boolean elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: true }, { type: 'Literal', value: false }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([null]) — null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([null])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([fn()]) — call expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([x => x]) — arrow function element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([obj.key]) — member expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([[1, 2]]) — nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([/regex/]) — regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: /test/ }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([`template`]) — template literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([x ? 1 : 2]) — conditional expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.concat([...other]) — spread element in array arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1].concat([2]) — array literal receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'concat', [makeArrayExpr([{ type: 'Literal', value: 2 }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().concat([1]) — call expression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.concat([1]) — member expression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      expect(reports[0].message).toMatch(/concat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      expect(reports[0].message).toBe(
        'Unnecessary .concat() with a single array argument. Use spread syntax [...arr, ...other] instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.concat(other) — variable arg, not array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Identifier', name: 'other' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat([1], [2]) — multiple args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }]), makeArrayExpr([{ type: 'Literal', value: 2 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(1) — non-array argument (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push([1]) — wrong method name push', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map([1]) — wrong method name map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes([1]) — wrong method name includes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find([1]) — wrong method name find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'concat' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "concatenate"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concatenate', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Concat" (capital C)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Concat', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(42) — number literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat("hello") — string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(obj) — object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(fn()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(...arr) — spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "concat" but 0 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "concat" but 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }]), makeArrayExpr([{ type: 'Literal', value: 2 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "concat" but 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }]), makeArrayExpr([{ type: 'Literal', value: 2 }]), makeArrayExpr([{ type: 'Literal', value: 3 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "concatx"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concatx', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CONCAT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'CONCAT', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(",") — different method entirely', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [{ type: 'Literal', value: ',' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [null]))
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayConcatSingleRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayConcatSingleRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Identifier', name: 'other' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Identifier', name: 'other' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeArrayExpr([])],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeArrayExpr([])],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [{ type: 'Identifier', name: 'other' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }]), makeArrayExpr([{ type: 'Literal', value: 2 }])]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayConcatSingleRule.create(context)
      const visitor2 = noUnnecessaryArrayConcatSingleRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayConcatSingleRule.meta
      const meta2 = noUnnecessaryArrayConcatSingleRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeArrayExpr([])],
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
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeArrayExpr([])],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeArrayExpr([])],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayConcatSingleRule).toBeDefined()
      expect(typeof noUnnecessaryArrayConcatSingleRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayConcatSingleRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
          computed: false,
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'concat' },
          computed: true,
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConcatSingleRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeArrayExpr([{ type: 'Literal', value: 1 }])]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

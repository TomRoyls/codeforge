import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToSplicedSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-to-spliced-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-spliced-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toSpliced', () => {
      const desc = noUnnecessaryArrayToSplicedSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tospliced/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-spliced-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayToSplicedSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayToSplicedSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports arr.toSpliced(...items)', () => {
    test('reports for arr.toSpliced(...items) with Identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toSpliced(...arr2) with different spread identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'toSpliced', [makeSpreadArg({ type: 'Identifier', name: 'arr2' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.toSpliced(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().toSpliced(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].toSpliced(...items) — ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toSpliced and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/toSpliced/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.toSpliced(...items) with spread is unusual. toSpliced() expects start, deleteCount, and items arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toSpliced', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toSpliced', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for this.items.toSpliced(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'items' } }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested call getArr().toSpliced(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal object callee .toSpliced(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression callee .toSpliced(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.toSpliced() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(1) with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(1, 2) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(1, 2, 3) with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(0, 0, ...items) with multiple args including spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 0 }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'splice', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSorted', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'push', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["toSpliced"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toSpliced' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr[toSpliced](...items) — computed with Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toSpliced' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toSpliced' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
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
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
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

    test('does not report when property name is "tospliced" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'tospliced', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOSPLICED" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'TOSPLICED', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(x) with single Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(fn()) with single CallExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(obj.items) with single MemberExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced([]) with single ArrayExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(0, 0) — two non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(start, deleteCount, ...items) — three args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Identifier', name: 'start' }, { type: 'Identifier', name: 'deleteCount' }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSpliced(start, deleteCount, item1, item2) — four args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Identifier', name: 'start' }, { type: 'Identifier', name: 'deleteCount' }, { type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeSpreadArg()],
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
      const visitor1 = noUnnecessaryArrayToSplicedSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayToSplicedSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'splice', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToSplicedSpreadRule.meta
      const meta2 = noUnnecessaryArrayToSplicedSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
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
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
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
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToSplicedSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayToSplicedSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayToSplicedSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSpliced' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toSpliced', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toSpliced', [makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments array has more than one element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSplicedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSpliced', [makeSpreadArg(), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })
  })
})

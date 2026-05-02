import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToSortedSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-to-sorted-spread.js'
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

function makeToSortedCallNode(
  object: unknown,
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
      property: { type: 'Identifier', name: 'toSorted' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-sorted-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toSorted', () => {
      const desc = noUnnecessaryArrayToSortedSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tosorted/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-sorted-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayToSortedSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayToSortedSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (23) =====

  describe('positive cases — reports toSorted with spread', () => {
    test('reports for arr.toSorted(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for list.toSorted(...elements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'list' }, [makeSpreadArg({ type: 'Identifier', name: 'elements' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].toSorted(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'ArrayExpression', elements: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.items.toSorted(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toSorted and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/toSorted/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.toSorted(...items) with spread is unusual. toSorted() expects a comparator function.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      const node = makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'list' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'list' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for chained call getArr().toSorted(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().toSorted(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, [makeSpreadArg({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.toSorted() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(compareFn) — regular function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'compareFn' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted((a, b) => a - b) — arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(extra, ...items) — two arguments reverse', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'extra' }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.sort(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'sort' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for toSorted(...items) — standalone call (no member)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toSorted' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["toSorted"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toSorted' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toSorted' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
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
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
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

    test('does not report when property name is "tosorted" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'tosorted' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOSORTED" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'TOSORTED' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a regular Identifier (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three SpreadElement arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted() with zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(customSort, extra) — two non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'customSort' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has three items', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal and second is SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 0 }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayToSortedSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayToSortedSpreadRule.create(ctx2)
      visitor1.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor2.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'fn' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'fn' }]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'list' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, []))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'fn' }]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'list' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToSortedSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayToSortedSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToSortedSpreadRule.meta
      const meta2 = noUnnecessaryArrayToSortedSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
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
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
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
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      const node = makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToSortedSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayToSortedSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayToSortedSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToSortedCallNode({ type: 'Identifier', name: 'list' }, [makeSpreadArg({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles non-computed member expression correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToSortedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toSorted' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-to-string-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

function makeToStringCall(
  object: unknown,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
  computed = false,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: 'toString' },
      computed,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-string-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toString', () => {
      const desc = noUnnecessaryArrayToStringSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tostring/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-string-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToStringSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToStringSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayToStringSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayToStringSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (27) =====

  describe('positive cases — reports unnecessary toString spread', () => {
    test('reports for arr.toString(...items) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toString(...[1, 2, 3]) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.list.toString(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'list' } }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'ArrayExpression', elements: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Literal', value: 'hello' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn.toString(...rest)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/toString/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.toString(...items) with spread is unusual. toString() expects no arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      const node = makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr2' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr2' }, [makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for new SomeClass().toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'NewExpression', callee: { type: 'Identifier', name: 'SomeClass' }, arguments: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a ? b : c).toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'ThisExpression' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.toString() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toString(x) with regular argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toString(x, y) with two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.valueOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
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

    test('does not report for arr.tostring(...items) — lowercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'tostring' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TOSTRING(...items) — uppercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'TOSTRING' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 1, 0, 1, 20, true))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is Literal (computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toString' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
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
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
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

    test('does not report for two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for spread with regular arg combo (...items, x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for regular arg and spread combo (x, ...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 'x' }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression — rule does not check object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression — rule does not check object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayToStringSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayToStringSpreadRule.create(ctx2)
      visitor1.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor2.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, []))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, []))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, []))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToStringSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayToStringSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToStringSpreadRule.meta
      const meta2 = noUnnecessaryArrayToStringSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
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
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
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
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      const node = makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToStringSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayToStringSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayToStringSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeToStringCall({ type: 'Identifier', name: 'arr2' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles computed: false explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})

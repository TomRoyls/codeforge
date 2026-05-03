import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFindSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-find-spread.js'
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

function makeSpreadArg(argumentType = 'Identifier', argumentName = 'items'): unknown {
  return { type: 'SpreadElement', argument: { type: argumentType, name: argumentName } }
}

function makeCallFindNode(
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
      property: { type: 'Identifier', name: 'find' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-find-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning find', () => {
      const desc = noUnnecessaryArrayFindSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/find/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFindSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFindSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayFindSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFindSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary find spread', () => {
    test('reports for arr.find(...items) with Identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.find(...items) with spread of a CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.find(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].find(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'ArrayExpression', elements: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().find(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/find/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.find(...items) with spread is unusual. find() expects a callback function.',
      )
    })

    test('report message mentions callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/callback/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      const node = makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'b' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'b' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of a Literal argument (unusual but matches)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'SpreadElement', argument: { type: 'Literal', value: 42 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().find(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, [makeSpreadArg('Identifier', 'args')]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal.find(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Literal', value: null }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 3, 5, 3, 40))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('reports for nested member expression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode(
        { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1,2,3].find(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.find(callback) — normal callback, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(fn) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(x => x > 0) — ArrowFunction argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(callback, thisArg) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'cb' }, { type: 'Identifier', name: 'ctx' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(...items, extra) — two arguments including spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["find"](...items) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'find' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for find(...items) — standalone function call, no member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'find' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Find" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'Find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "find" but computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(Literal) — non-spread single argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(ObjectExpression) — non-spread single argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(MemberExpression) — non-spread single argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'cb' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(FunctionExpression) — non-spread single argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('reports when callee object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "finds" (not exact match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'finds' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments with spread as first', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "find" but with extra arguments beyond one', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFindSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor2.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'cb' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mix of valid and invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'cb' }]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
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
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [{ type: 'Identifier', name: 'cb' }]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, []))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayFindSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFindSpreadRule.meta
      const meta2 = noUnnecessaryArrayFindSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
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
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
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
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      const node = makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFindSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFindSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFindSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
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
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false explicitly set on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindSpreadRule.create(context)
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeCallFindNode({ type: 'Identifier', name: 'b' }, [makeSpreadArg('Identifier', 'args')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

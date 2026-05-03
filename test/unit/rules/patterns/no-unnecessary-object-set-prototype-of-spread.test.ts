import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectSetPrototypeOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-set-prototype-of-spread.js'
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

function makeObjectSetPrototypeOfCall(
  spreadArg: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 40,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'setPrototypeOf' },
      computed: false,
    },
    arguments: [spreadArg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-set-prototype-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning setPrototypeOf', () => {
      const desc = noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/setprototypeof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-set-prototype-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.setPrototypeOf(...spread)', () => {
    test('reports for Object.setPrototypeOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...obj.props)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...getItems())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions setPrototypeOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports[0].message).toMatch(/setPrototypeOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports[0].message).toBe(
        'Object.setPrototypeOf(...items) with spread is unusual. setPrototypeOf() expects an object and a prototype.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      const node = makeObjectSetPrototypeOfCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall(undefined, 5, 10, 5, 50))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.setPrototypeOf(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...{ a: 1 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(cond ? a : b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(a || b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(a + b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...`template`)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(() => {}))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(fn()))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...obj.deep.nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'deep' } }, property: { type: 'Identifier', name: 'nested' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(await items))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'items' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.setPrototypeOf(...(new Set()))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.setPrototypeOf(...(a, b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] } }))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.setPrototypeOf(obj, proto) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(...a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }, { type: 'Identifier', name: 'b' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(obj) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(42) — literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(fn()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.setPrototypeOf(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getPrototypeOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee object "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee property "setprototypeof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setprototypeof' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (is Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'setPrototypeOf' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObj' }, arguments: [] },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(...items, extra) — two args first is spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(null) — literal null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.setPrototypeOf(ArrayExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectSetPrototypeOfCall())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      // valid: two args
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'proto' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      // invalid: one spread arg
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      // valid: wrong object name
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      // invalid: one spread arg
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }))
      // valid: zero args
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectSetPrototypeOfSpreadRule.meta
      const meta2 = noUnnecessaryObjectSetPrototypeOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
        range: [0, 40],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
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
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      const node = makeObjectSetPrototypeOfCall()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectSetPrototypeOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectSetPrototypeOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectSetPrototypeOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall(undefined, 10, 4, 10, 50))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('handles non-computed member expression correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee computed is true with correct property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall())
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles Object.setPrototypeOf with argument array containing SpreadElement as element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }] }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } } }))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeObjectSetPrototypeOfCall({ type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } } }))
      expect(reports.length).toBe(1)
    })
  })
})

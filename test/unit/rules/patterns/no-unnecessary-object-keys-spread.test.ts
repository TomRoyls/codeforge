import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectKeysSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-keys-spread.js'
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

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

function makeObjectKeysCall(
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'keys' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-keys-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.keys and spread', () => {
      const desc = noUnnecessaryObjectKeysSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object/)
      expect(desc).toMatch(/keys/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-keys-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectKeysSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectKeysSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectKeysSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectKeysSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.keys spread', () => {
    test('reports for Object.keys(...items) with SpreadElement arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...arr) with Identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...obj.props) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...getItems()) with CallExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...[1,2,3]) with ArrayExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.keys or spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Object\.keys/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Object.keys(...items) with spread is unusual. keys() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      const node = makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.keys(...{a:1}) with ObjectExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...fn) with Identifier spread named fn', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'fn' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...new Map()) with NewExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...(x ? a : b)) with ConditionalExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(...a.b) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.keys with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys with ArrowFunctionExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with specific loc start/end values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 3, 5, 3, 28))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports for Object.keys with spread of computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Literal', value: 'key' }, computed: true })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys with spread at different line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('reports for Object.keys with UnaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.keys(obj) — non-spread Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys({a:1}) — ObjectExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys([1,2]) — ArrayExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(...items) — wrong method name "values"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items) — wrong method name "entries"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyNames(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.keys(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObject' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.keys(...items) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ctx' }, property: { type: 'Identifier', name: 'obj' } },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items, extra) — 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items, extra, third) — 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }, { type: 'Identifier', name: 'third' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member Object["keys"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'keys' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is not "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is not "keys"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "object" (lowercase) as object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "KEYS" (uppercase) as property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'KEYS' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(fn()) — CallExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectKeysSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectKeysSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeObjectKeysCall([{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectKeysCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectKeysCall([]))
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      visitor.CallExpression(makeObjectKeysCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectKeysSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectKeysSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectKeysSpreadRule.meta
      const meta2 = noUnnecessaryObjectKeysSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      const node = makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectKeysSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectKeysSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectKeysSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false on member expression (should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('computed: true on member expression (should NOT report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectKeysCall([makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles argument that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([null]))
      expect(reports.length).toBe(0)
    })

    test('handles argument with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression(makeObjectKeysCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('handles callee with optional true MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
          optional: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})

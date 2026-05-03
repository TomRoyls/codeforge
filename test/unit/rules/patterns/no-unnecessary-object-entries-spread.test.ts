import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectEntriesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-entries-spread.js'
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

function makeObjectEntriesCallNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-entries-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.entries and spread', () => {
      const desc = noUnnecessaryObjectEntriesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object/)
      expect(desc).toMatch(/entries/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-entries-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectEntriesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectEntriesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.entries with spread', () => {
    test('reports for Object.entries(...items) with Identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.entries(...arr) with Identifier named arr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.entries(...obj) with Identifier named obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'obj' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.entries(...data) with Identifier named data', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with MemberExpression argument obj.items', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with CallExpression argument getItems()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'ObjectExpression', properties: [] }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with nested MemberExpression obj.a.b', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'a' } },
          property: { type: 'Identifier', name: 'b' },
        }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with function call with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Identifier', name: 'x' }] }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread and entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
      expect(reports[0].message).toMatch(/entries/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Object.entries(...items) with spread is unusual. entries() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      const node = makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }),
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }),
      ]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.keys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'keys', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'values', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'assign', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.entries(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('MyObject', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for object.entries(...items) — lowercase object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for OBJECT.entries(...items) — uppercase object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('OBJECT', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(items) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(obj) — non-spread Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries({}) — non-spread ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...a, ...b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'Identifier', name: 'a' }),
        makeSpreadElement({ type: 'Identifier', name: 'b' }),
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement({ type: 'Identifier', name: 'items' }),
        { type: 'Identifier', name: 'extra' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member Object["entries"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'entries' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'entries' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Entries" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'Entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(Literal argument) — non-spread Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectEntriesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectEntriesSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'keys', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('MyObject', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectEntriesSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectEntriesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectEntriesSpreadRule.meta
      const meta2 = noUnnecessaryObjectEntriesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      const node = makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectEntriesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectEntriesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectEntriesSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('handles non-computed member expression correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'entries' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for Object.entries with SpreadElement as second arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        { type: 'Identifier', name: 'obj' },
        makeSpreadElement({ type: 'Identifier', name: 'rest' }),
      ]))
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with nested SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement(makeSpreadElement({ type: 'Identifier', name: 'items' })),
      ]))
      expect(reports.length).toBe(1)
    })

    test('SpreadElement with null argument still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectEntriesSpreadRule.create(context)
      visitor.CallExpression(makeObjectEntriesCallNode('Object', 'entries', [
        makeSpreadElement(null),
      ]))
      expect(reports.length).toBe(1)
    })
  })
})

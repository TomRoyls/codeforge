import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectFreezeSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-freeze-spread.js'
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

function makeObjectFreezeCallNode(
  objectName: string,
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

describe('no-unnecessary-object-freeze-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.freeze and spread', () => {
      const desc = noUnnecessaryObjectFreezeSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/freeze/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-freeze-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectFreezeSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectFreezeSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.freeze with spread', () => {
    test('reports for Object.freeze(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze(...obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'obj' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.freeze and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/freeze/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Object.freeze(...items) with spread is unusual. freeze() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      const node = makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.freeze with spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.freeze with spread of new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.freeze with spread of await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.freeze(obj) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze({}) — object literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(a, b, c) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.freeze(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Array', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.freeze(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Math', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.freeze(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('MyObj', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'assign', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'keys', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'values', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'entries', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.create(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'create', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.define(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'define', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object["freeze"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'freeze' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'freeze' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'freeze' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Freeze" (uppercase F)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'Freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "isFrozen"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'isFrozen', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for freeze(...items) — plain function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'freeze' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectFreezeSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectFreezeSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
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
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Array', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'assign', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectFreezeSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectFreezeSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectFreezeSpreadRule.meta
      const meta2 = noUnnecessaryObjectFreezeSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
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
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      const node = makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectFreezeSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectFreezeSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectFreezeSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('Object.freeze with spread and null argument node still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement(null)]))
      expect(reports.length).toBe(1)
    })

    test('Object.freeze with spread argument being another spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression(makeObjectFreezeCallNode('Object', 'freeze', [makeSpreadElement(makeSpreadElement({ type: 'Identifier', name: 'deep' }))]))
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectFreezeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})

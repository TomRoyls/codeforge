import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectDefinePropertySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-define-property-spread.js'
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

function makeObjectDefinePropertyCall(
  args: unknown[] = [],
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
      property: { type: 'Identifier', name: 'defineProperty' },
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

describe('no-unnecessary-object-define-property-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning defineProperty', () => {
      const desc = noUnnecessaryObjectDefinePropertySpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/defineproperty/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-define-property-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule).toBeDefined()
      expect(noUnnecessaryObjectDefinePropertySpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectDefinePropertySpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Object.defineProperty spread', () => {
    test('reports for Object.defineProperty(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.defineProperty(...arr) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.defineProperty(...args) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'args' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.defineProperty(...fn()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions defineProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/defineProperty/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Object.defineProperty(...items) with spread is unusual. defineProperty() expects an object, key, and descriptor.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      const node = makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 50))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message mentions "expects an object, key, and descriptor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/expects an object, key, and descriptor/)
    })

    test('reports for spread with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.defineProperty(obj, key, desc) — three args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([
        { type: 'Identifier', name: 'obj' },
        { type: 'Literal', value: 'key' },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperty(obj, key) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([
        { type: 'Identifier', name: 'obj' },
        { type: 'Literal', value: 'key' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperty(obj) — one non-spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([
        { type: 'Identifier', name: 'obj' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperty() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperties(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.defineProperty(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObj' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.defineProperty(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'defineProperty' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'defineProperty' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when two arguments include a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([
        makeSpreadElement({ type: 'Identifier', name: 'items' }),
        { type: 'Literal', value: 'extra' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has computed: true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "defineproperty" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineproperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.create(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'create' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([null]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectDefinePropertySpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectDefinePropertySpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeObjectDefinePropertyCall([{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectDefinePropertyCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
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
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectDefinePropertyCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }, { type: 'ObjectExpression', properties: [] }]))
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      visitor.CallExpression(makeObjectDefinePropertyCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectDefinePropertyCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectDefinePropertySpreadRule.meta
      const meta2 = noUnnecessaryObjectDefinePropertySpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
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
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      const node = makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectDefinePropertySpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectDefinePropertySpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectDefinePropertySpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 50))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'defineProperty' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: 'not-an-array',
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([{ type: 'SpreadElement', argument: null }]))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([{ type: 'SpreadElement' }]))
      expect(reports.length).toBe(1)
    })

    test('does not report when argument type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([{ name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('handles deeply nested spread with AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertyCall([makeSpreadElement({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } })]))
      expect(reports.length).toBe(1)
    })

    test('does not report for Object.freeze(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })
  })
})

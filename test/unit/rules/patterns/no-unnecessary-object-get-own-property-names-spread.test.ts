import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectGetOwnPropertyNamesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-get-own-property-names-spread.js'
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

function makeSpreadArg(argument?: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument: argument ?? { type: 'Identifier', name: 'items' },
  }
}

function makeCallNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 50,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-get-own-property-names-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning getOwnPropertyNames', () => {
      const desc = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/getownpropertynames/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-get-own-property-names-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary spread', () => {
    test('reports for Object.getOwnPropertyNames(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'list' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions getOwnPropertyNames', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/getOwnPropertyNames/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'Object.getOwnPropertyNames(...items) with spread is unusual. getOwnPropertyNames() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      const node = makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()], 5, 10, 5, 60))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.getOwnPropertyNames(obj) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyNames() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyNames(a, b) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.getOwnPropertyNames(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Array', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.getOwnPropertyNames(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('MyObj', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'keys', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'values', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'entries', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'assign', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'freeze', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for getOwnPropertyNames(...items) — no Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getOwnPropertyNames' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.getOwnPropertyNames(...items) — non-Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Literal', value: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "getownpropertynames" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getownpropertynames', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertySymbols(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertySymbols', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperty(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'defineProperty', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.create(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'create', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Array', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Object', 'keys', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta
      const meta2 = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
        range: [0, 50],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
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
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      const node = makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()], 10, 4, 10, 55))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(55)
    })

    test('handles computed member expression property — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-computed member expression — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for Object.getOwnPropertyNames with spread and extra args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyNamesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'getOwnPropertyNames', [null]))
      expect(reports.length).toBe(0)
    })
  })
})

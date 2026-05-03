import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-get-own-property-descriptors-spread.js'
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

function makeSpreadNode(
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

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-get-own-property-descriptors-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning getOwnPropertyDescriptors', () => {
      const desc = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/getownpropertydescriptors/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-get-own-property-descriptors-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary spread', () => {
    test('reports for Object.getOwnPropertyDescriptors(...items) basic case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'obj' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions getOwnPropertyDescriptors', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/getOwnPropertyDescriptors/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Object.getOwnPropertyDescriptors(...items) with spread is unusual. getOwnPropertyDescriptors() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      const node = makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 60))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with specific loc range values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 55))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(55)
    })

    test('reports when callee has computed:false explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('reports for spread with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-spread argument: Object.getOwnPropertyDescriptors(obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 arguments: Object.getOwnPropertyDescriptors()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments: Object.getOwnPropertyDescriptors(...a, ...b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong object name: MyObj.getOwnPropertyDescriptors(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('MyObj', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name: Object.getOwnPropertyDescriptor(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name: Object.keys(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'keys', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name: Object.values(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'values', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name: Object.entries(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'entries', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name: Object.assign(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'assign', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name: Object.getOwnPropertyNames(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyNames', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObj' }, arguments: [] },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object.name is not "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Array', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.property.name is not "getOwnPropertyDescriptors"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'defineProperty', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "object" (lowercase) name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "getownpropertydescriptors" (lowercase) method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getownpropertydescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "OBJECT" (uppercase) name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('OBJECT', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(ctx2)
      visitor1.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeSpreadNode('MyObj', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeSpreadNode('Object', 'keys', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta
      const meta2 = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
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
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      const node = makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 55))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(55)
    })

    test('handles computed member expression with false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'getOwnPropertyDescriptors' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('non-SpreadElement argument type does not report (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [{ type: 'Literal', value: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('non-SpreadElement argument type does not report (ObjectExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('handles spread with LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule.create(context)
      visitor.CallExpression(makeSpreadNode('Object', 'getOwnPropertyDescriptors', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })
  })
})

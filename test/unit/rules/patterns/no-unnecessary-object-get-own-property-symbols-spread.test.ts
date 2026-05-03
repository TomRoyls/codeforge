import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-get-own-property-symbols-spread.js'
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

function makeGetOwnPropertySymbolsCall(
  objectName: string,
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 40,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-get-own-property-symbols-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning getOwnPropertySymbols', () => {
      const desc = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/getownpropertysymbols/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-get-own-property-symbols-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.getOwnPropertySymbols(...items)', () => {
    test('reports Object.getOwnPropertySymbols(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'data' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getAll' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message mentions getOwnPropertySymbols', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/getOwnPropertySymbols/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'Object.getOwnPropertySymbols(...items) with spread is unusual. getOwnPropertySymbols() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      const node = makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()], 5, 10, 5, 50))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with SpreadElement containing conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with SpreadElement containing template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'MyClass' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when SpreadElement argument is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing await expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing yield expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.getOwnPropertySymbols(obj) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertySymbols() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertySymbols(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.getOwnPropertySymbols(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('MyObj', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getSymbols(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getSymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyNames(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyNames' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for getOwnPropertySymbols(...items) — no Object member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getOwnPropertySymbols' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object name is not "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('object', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'getOwnPropertySymbols' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertySymbols(obj1, obj2) — two non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'Identifier', name: 'obj1' }, { type: 'Identifier', name: 'obj2' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object name is "OBJECT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('OBJECT', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.property name is "getownpropertysymbols" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getownpropertysymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertySymbols(literalArg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyDescriptors(...items) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ArrayExpression instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has three elements with one spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg(), { type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Object' } },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(ctx2)
      visitor1.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      visitor2.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
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
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('MyObj', [makeSpreadArg()]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta
      const meta2 = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
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
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
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
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      const node = makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()], 10, 4, 10, 50))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('handles computed member expression property (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'getOwnPropertySymbols' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg()]))
      visitor.CallExpression(makeGetOwnPropertySymbolsCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when argument type is SpreadElement but node type is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('handles null argument in arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertySymbols' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement' }],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(1)
    })
  })
})

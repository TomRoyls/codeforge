import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectIsFrozenSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-is-frozen-spread.js'
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

function makeReflectIsFrozenCall(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
  objectName = 'Reflect',
  propertyName = 'isFrozen',
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-reflect-is-frozen-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Reflect', () => {
      const desc = noUnnecessaryReflectIsFrozenSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reflect/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-is-frozen-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectIsFrozenSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectIsFrozenSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports Reflect.isFrozen(...items) spread', () => {
    test('reports for Reflect.isFrozen(...items) with identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen(...arr) with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen(...args) with args identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArgs' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Reflect.isFrozen and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      expect(reports[0].message).toMatch(/Reflect\.isFrozen/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'Reflect.isFrozen(...items) with spread is unusual. isFrozen() expects a single object argument.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      const node = makeReflectIsFrozenCall([makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Reflect.isFrozen with spread over conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over arrow function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Reflect.isFrozen with spread over binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over parenthesized expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.isFrozen with spread over new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.isFrozen(obj) with one non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isFrozen() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isFrozen(obj, extra) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([
        { type: 'Identifier', name: 'obj' },
        { type: 'Identifier', name: 'extra' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isFrozen(...items, extra) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'Reflect', 'apply'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'Reflect', 'construct'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'Reflect', 'get'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.set(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'Reflect', 'set'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.defineProperty(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'Reflect', 'defineProperty'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'Reflect', 'deleteProperty'))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.isFrozen(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'foo', 'isFrozen'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.isFrozen(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'MyObj', 'isFrozen'))
      expect(reports.length).toBe(0)
    })

    test('does not report for reflect.isFrozen(...items) — lowercase reflect', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'reflect', 'isFrozen'))
      expect(reports.length).toBe(0)
    })

    test('does not report for REFLECT.isFrozen(...items) — uppercase REFLECT', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 1, 0, 1, 20, 'REFLECT', 'isFrozen'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression, not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getReflect' }, arguments: [] },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'isFrozen' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when the single argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isFrozen with single Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectIsFrozenSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectIsFrozenSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor2.CallExpression(makeReflectIsFrozenCall([{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsFrozenCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly with many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsFrozenCall([]))
      visitor.CallExpression(makeReflectIsFrozenCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsFrozenCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectIsFrozenSpreadRule.meta
      const meta2 = noUnnecessaryReflectIsFrozenSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
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
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
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
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      const node = makeReflectIsFrozenCall([makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectIsFrozenSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectIsFrozenSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectIsFrozenSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
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
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isFrozen' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'isFrozen' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsFrozenSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsFrozenCall([makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectDeletePropertySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-delete-property-spread.js'
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

function makeReflectDeletePropertyCall(
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
      object: { type: 'Identifier', name: 'Reflect' },
      property: { type: 'Identifier', name: 'deleteProperty' },
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

describe('no-unnecessary-reflect-delete-property-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Reflect.deleteProperty', () => {
      const desc = noUnnecessaryReflectDeletePropertySpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reflect/)
      expect(desc).toMatch(/deleteproperty/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-delete-property-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule).toBeDefined()
      expect(noUnnecessaryReflectDeletePropertySpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectDeletePropertySpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Reflect.deleteProperty(...spread)', () => {
    test('reports for Reflect.deleteProperty(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.deleteProperty(...arr) with identifier spread named arr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.deleteProperty(...[1, 2, 3]) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.deleteProperty(...getItems()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.deleteProperty(...obj.props) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Reflect.deleteProperty and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Reflect\.deleteProperty/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Reflect.deleteProperty(...items) with spread is unusual. deleteProperty() expects a target and property key.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      const node = makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread of empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.deleteProperty(obj, key) — two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'key' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(obj, "key") — two arguments with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(obj) — one non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items, extra) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items, ...more) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' }), makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'apply' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'get' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.set(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'set' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.has(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'has' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyReflect.deleteProperty(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyReflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for reflect.deleteProperty(...items) — lowercase reflect', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for REFLECT.deleteProperty(...items) — uppercase REFLECT', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'REFLECT' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.deleteProperty(...items) — non-Reflect object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect[deleteProperty](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'deleteProperty' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is MemberExpression not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is not Identifier (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectDeletePropertySpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectDeletePropertySpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'key' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'key' }]))
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
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
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'key' }]))
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression({ type: 'Identifier', name: 'foo' })
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeReflectDeletePropertyCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectDeletePropertySpreadRule.meta
      const meta2 = noUnnecessaryReflectDeletePropertySpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
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
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
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
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      const node = makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectDeletePropertySpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectDeletePropertySpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectDeletePropertySpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
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
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'x' })], 10, 4, 10, 45))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(45)
    })

    test('handles computed member expression property as false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'deleteProperty' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeReflectDeletePropertyCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when spread argument type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([{ argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when spread argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      visitor.CallExpression(makeReflectDeletePropertyCall([null]))
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectDeletePropertySpreadRule.create(context)
      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 30),
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

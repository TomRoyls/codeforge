import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-get-own-property-descriptor-spread.js'
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

function makeReflectCall(
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
      object: { type: 'Identifier', name: 'Reflect' },
      property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
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

describe('no-unnecessary-reflect-get-own-property-descriptor-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning getOwnPropertyDescriptor', () => {
      const desc = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/getownpropertydescriptor/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-get-own-property-descriptor-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary spread', () => {
    test('reports Reflect.getOwnPropertyDescriptor(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getKeys' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing an array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions getOwnPropertyDescriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports[0].message).toMatch(/getOwnPropertyDescriptor/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'Reflect.getOwnPropertyDescriptor(...items) with spread is unusual. getOwnPropertyDescriptor() expects a target and property key.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      const node = makeReflectCall([makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()], 5, 10, 5, 60))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with SpreadElement argument referencing a conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing a template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing a function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument referencing a logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee computed is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when callee has no computed field (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement referencing a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement referencing an arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement referencing a typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.getOwnPropertyDescriptor(obj, "key") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getOwnPropertyDescriptor() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getOwnPropertyDescriptor(obj) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getOwnPropertyDescriptor(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getOwnPropertyDescriptor(extra, ...items) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'extra' }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      // Manually create with wrong method name
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'get' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.set(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'set' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyDescriptor(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.getOwnPropertyDescriptor(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
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

    test('does not report when callee is computed (bracket notation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getOwnPropertyDescriptor with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Literal', value: 'key' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.getOwnPropertyDescriptor with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "reflect" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "GetOwnPropertyDescriptor" (PascalCase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'GetOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "getOwnPropertyDescriptors" (plural)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptors' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'apply' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.construct(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'construct' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'deleteProperty' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.has(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'has' },
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
      const visitor1 = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectCall([makeSpreadArg()]))
      visitor2.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }]))
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
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
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }]))
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      visitor.CallExpression({ type: 'Identifier', name: 'foo' })
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }, { type: 'Literal', value: 'key' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta
      const meta2 = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
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
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
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
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      const node = makeReflectCall([makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 50),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()], 10, 4, 10, 55))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(55)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([makeSpreadArg()]))
      visitor.CallExpression(makeReflectCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule.create(context)
      visitor.CallExpression(makeReflectCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })
  })
})

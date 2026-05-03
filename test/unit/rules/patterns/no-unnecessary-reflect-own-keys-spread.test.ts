import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectOwnKeysSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-own-keys-spread.js'
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

function makeReflectOwnKeysCall(
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
      property: { type: 'Identifier', name: 'ownKeys' },
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

describe('no-unnecessary-reflect-own-keys-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Reflect.ownKeys', () => {
      const desc = noUnnecessaryReflectOwnKeysSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reflect/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-own-keys-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectOwnKeysSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectOwnKeysSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Reflect.ownKeys(...items) with spread', () => {
    test('reports for Reflect.ownKeys(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...arr) with array identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...obj) with object identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'obj' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...getTargets()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getTargets' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...[a, b, c]) with array expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...data) with data identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...config.targets) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'config' }, property: { type: 'Identifier', name: 'targets' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Reflect.ownKeys and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Reflect\.ownKeys/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Reflect.ownKeys(...items) with spread is unusual. ownKeys() expects a single target.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      const node = makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Reflect.ownKeys(...args) with args identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Reflect.ownKeys(...list) with list identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'list' })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when spread argument is a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a function call with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 1 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a chained member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a tagged template expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.ownKeys(obj) — no spread, single argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(a, ...b) — two arguments with spread second', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'a' }, makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(...a, ...b) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'a' }), makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
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
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
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

    test('does not report for Reflect.apply(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
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

    test('does not report for Object.keys(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.ownKeys(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect["ownKeys"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'ownKeys' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ownKeys(...items) — plain function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ownKeys' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getReflect' }, arguments: [] },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'ownKeys' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'ownKeys' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ownkeys" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownkeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "reflect" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is a regular Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'target' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectOwnKeysSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectOwnKeysSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'target' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'target' }]))
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
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
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'target' }]))
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ownKeys' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makeReflectOwnKeysCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectOwnKeysSpreadRule.meta
      const meta2 = noUnnecessaryReflectOwnKeysSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
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
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
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
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      const node = makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectOwnKeysSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectOwnKeysSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectOwnKeysSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'ownKeys' },
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
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ type: 'Identifier', name: 'target' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([{ name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeReflectOwnKeysCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles argument that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments with one spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectOwnKeysSpreadRule.create(context)
      visitor.CallExpression(makeReflectOwnKeysCall([
        makeSpreadElement({ type: 'Identifier', name: 'items' }),
        { type: 'Identifier', name: 'b' },
        { type: 'Identifier', name: 'c' },
      ]))
      expect(reports.length).toBe(0)
    })
  })
})

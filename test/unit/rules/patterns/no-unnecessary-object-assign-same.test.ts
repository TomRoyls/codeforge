import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectAssignSameRule } from '../../../../src/rules/patterns/no-unnecessary-object-assign-same.js'
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

function makeObjectAssignCall(args: unknown[], locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'assign' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-assign-same rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.assign', () => {
      const desc = noUnnecessaryObjectAssignSameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object\.assign/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-object-assign-same.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectAssignSameRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectAssignSameRule).toBeDefined()
      expect(noUnnecessaryObjectAssignSameRule.meta).toBeDefined()
      expect(noUnnecessaryObjectAssignSameRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary Object.assign', () => {
    test('reports for Object.assign(obj) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign({}) — empty object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign({ a: 1 }) — object with property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } }] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(target) — single variable target', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(this) — this expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ThisExpression' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(fn()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(new Foo()) — new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(arr) — array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(obj.bar) — member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'bar' } }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports[0].message).toMatch(/Object\.assign/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports[0].message).toBe(
        'Unnecessary Object.assign() with a single argument. Object.assign(x) returns x unchanged. Use the object directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      const node = makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj1' }]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj2' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj1' }]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.assign(null) — null literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(undefined) — undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.assign(a ? b : c) — conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(() => {}) — arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(class Foo {}) — class expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ClassExpression', id: { type: 'Identifier', name: 'Foo' }, body: { type: 'ClassBody', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(template) — template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign([...arr]) — spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(42) — number literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign("str") — string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Literal', value: 'str' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(true) — boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(/regex/) — regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(super) — super expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Super' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(yield x) — yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'YieldExpression', argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(await x) — await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(void 0) — unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...args) — spread element as only argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.assign() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign({}, { a: 1 }) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ObjectExpression', properties: [] }, { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign({}, obj) — two arguments with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ObjectExpression', properties: [] }, { type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(target, source1, source2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }, { type: 'Identifier', name: 'source1' }, { type: 'Identifier', name: 'source2' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.assign(obj) — not global Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObject' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(obj) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(obj) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(obj) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.create(proto) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'create' },
        },
        arguments: [{ type: 'Identifier', name: 'proto' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperties(obj, props) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'props' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for assign(obj) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assign' },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Object identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Assign" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'Assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ASSIGN" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'ASSIGN' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign with five arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
        { type: 'Identifier', name: 'c' },
        { type: 'Identifier', name: 'd' },
        { type: 'Identifier', name: 'e' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign with ten arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      const args = Array.from({ length: 10 }, (_, i) => ({ type: 'Identifier', name: `arg${i}` }))
      visitor.CallExpression(makeObjectAssignCall(args))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectAssignSameRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectAssignSameRule.create(ctx2)
      visitor1.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      visitor2.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectAssignCall([]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectAssignSameRule.create(context)
      const visitor2 = noUnnecessaryObjectAssignSameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectAssignSameRule.meta
      const meta2 = noUnnecessaryObjectAssignSameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      const node = makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSameRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'obj' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})

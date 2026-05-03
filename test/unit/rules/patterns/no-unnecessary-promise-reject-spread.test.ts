import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseRejectSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-promise-reject-spread.js'
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

function makePromiseRejectCallNode(
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
      object: { type: 'Identifier', name: 'Promise' },
      property: { type: 'Identifier', name: 'reject' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(arg: unknown): unknown {
  return { type: 'SpreadElement', argument: arg }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-reject-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.reject', () => {
      const desc = noUnnecessaryPromiseRejectSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-promise-reject-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule).toBeDefined()
      expect(noUnnecessaryPromiseRejectSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseRejectSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Promise.reject with spread', () => {
    test('reports for Promise.reject(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...arr) with variable spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...errors) with errors spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'errors' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...[1, 2, 3]) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...args) with args spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with CallExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getErrors' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'errors' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message mentions reject', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/reject/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Promise.reject(...items) with spread is unusual. reject() expects a single reason.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const node = makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Promise.reject(...) with ArrayExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with nested spread in spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'deep' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with ConditionalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with BinaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with Literal spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with ArrowFunctionExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...) with ObjectExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(...new Error()) with NewExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Promise.reject(new Error("msg")) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [{ type: 'Literal', value: 'msg' }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject(err) — single identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'Identifier', name: 'err' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject(null) — single null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject(a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.resolve(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyPromise.reject(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyPromise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.reject(...items) — non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'reject' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "reject" but computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Resolve" (wrong case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'Resolve' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getPromise' }, arguments: [] },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "promise" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments have zero elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments have two elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([
        makeSpreadElement({ type: 'Identifier', name: 'a' }),
        { type: 'Identifier', name: 'b' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'Literal', value: 'error' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getError' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
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
      const visitor1 = noUnnecessaryPromiseRejectSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseRejectSpreadRule.create(ctx2)
      visitor1.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makePromiseRejectCallNode([{ type: 'Identifier', name: 'err' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'Identifier', name: 'err' }]))
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'Identifier', name: 'err' }]))
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseRejectCallNode([]))
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'Literal', value: 'error' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const visitor2 = noUnnecessaryPromiseRejectSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseRejectSpreadRule.meta
      const meta2 = noUnnecessaryPromiseRejectSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
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
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
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
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const node = makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseRejectSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseRejectSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseRejectSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('handles computed member expression property (non-computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'reject' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [{ type: 'Literal', value: 'fail' }] }]))
      expect(reports.length).toBe(0)
    })

    test('handles three arguments with one being spread (does not report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      visitor.CallExpression(makePromiseRejectCallNode([
        makeSpreadElement({ type: 'Identifier', name: 'a' }),
        { type: 'Identifier', name: 'b' },
        { type: 'Identifier', name: 'c' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('report node preserves exact input node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectSpreadRule.create(context)
      const node = makePromiseRejectCallNode([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
      expect(reports[0].node).toHaveProperty('type', 'CallExpression')
    })
  })
})

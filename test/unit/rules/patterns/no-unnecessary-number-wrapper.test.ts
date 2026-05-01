import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberWrapperRule } from '../../../../src/rules/patterns/no-unnecessary-number-wrapper.js'
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

function makeNumberCallNode(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Number' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== TESTS (95) =====

describe('no-unnecessary-number-wrapper rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Number', () => {
      const desc = noUnnecessaryNumberWrapperRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/number/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-wrapper.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberWrapperRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberWrapperRule).toBeDefined()
      expect(noUnnecessaryNumberWrapperRule.meta).toBeDefined()
      expect(noUnnecessaryNumberWrapperRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====
  describe('positive cases — reports Number() calls', () => {
    test('reports Number() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(x) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(42) with literal number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number("42") with literal string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Literal', value: '42' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(true) with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(null) with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(foo) with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'foo' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(obj.val) with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'val' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(fn()) with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(a + b) with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(arr[0]) with computed member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Literal', value: 0 },
        computed: true,
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number(...args) with spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'args' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      expect(reports[0].message).toMatch(/Number/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      expect(reports[0].message).toBe(
        'Unnecessary Number() call on a value. Remove the wrapper or use a numeric operation.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      const node = makeNumberCallNode([])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports Number(a, b) with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'ArrayExpression',
        elements: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'ObjectExpression',
        properties: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with assignment expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Number with regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(1)
    })

    test('reports Number with sequence expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([{
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report for String(x) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(x) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(x) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(x) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(x) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(x) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isInteger(x) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isInteger' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.Number(x) — MemberExpression with Number property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'Number' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "number" — string literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'number', loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "number" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'number' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "NUMBER" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'NUMBER' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for myNumber(x) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myNumber' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for toNumber(x) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toNumber' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 0 } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberWrapperRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberWrapperRule.create(ctx2)
      visitor1.CallExpression(makeNumberCallNode([]))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberWrapperRule.create(context)
      const visitor2 = noUnnecessaryNumberWrapperRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberWrapperRule.meta
      const meta2 = noUnnecessaryNumberWrapperRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
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
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      const node = makeNumberCallNode([])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberWrapperRule).toBeDefined()
      expect(typeof noUnnecessaryNumberWrapperRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberWrapperRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression(makeNumberCallNode([]))
      visitor.CallExpression(makeNumberCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles CallExpression with callee type not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Literal', value: 42 },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with callee as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'Number',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

  })
})

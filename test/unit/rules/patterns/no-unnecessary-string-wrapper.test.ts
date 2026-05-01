import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringWrapperRule } from '../../../../src/rules/patterns/no-unnecessary-string-wrapper.js'
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

function makeStringCallNode(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'String' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallNodeWithIdentifier(
  calleeName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallNodeWithMemberCallee(
  objectName: string,
  propertyName: string,
  args: unknown[] = [],
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: args,
    loc: makeLoc(1, 0, 1, 20),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-wrapper rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringWrapperRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringWrapperRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringWrapperRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringWrapperRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringWrapperRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning String', () => {
      const desc = noUnnecessaryStringWrapperRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/string/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringWrapperRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-wrapper.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringWrapperRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringWrapperRule).toBeDefined()
      expect(noUnnecessaryStringWrapperRule.meta).toBeDefined()
      expect(noUnnecessaryStringWrapperRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (34) =====

  describe('positive cases — reports unnecessary String()', () => {
    test('reports String() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports String(x) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(42) with numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports String("hello") with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(true) with boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(null) with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(a, b) with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports String(obj.prop) with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(getValue()) with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(arr[0]) with computed member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Literal', value: 0 },
        computed: true,
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(1 + 2) with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(!x) with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(x ? a : b) with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(...arr) with spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'arr' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(/regex/) with regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(template) with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(new Foo()) with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String([1, 2]) with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String({}) with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'ObjectExpression',
        properties: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(fn()) with member expression call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(asyncFn()) with async call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'asyncFn' },
        arguments: [],
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(x ?? y) with nullish coalescing argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'BinaryExpression',
        operator: '??',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(x || y) with logical OR argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(x && y) with logical AND argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(x instanceof Foo) with instanceof argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Foo' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports String(typeof x) with typeof unary argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toMatch(/String\(\)/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toBe(
        'Unnecessary String() call on a value. Remove the wrapper or use a template literal.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      const node = makeStringCallNode([{ type: 'Identifier', name: 'x' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([]))
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([]))
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports String(x) where x is an await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'promise' }, arguments: [] },
      }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number(x) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('Number', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(x) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('Boolean', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(x) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('parseInt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(x) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('parseFloat', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for toString() — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('toString', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.String() — member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithMemberCallee('foo', 'String'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.method() — member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithMemberCallee('obj', 'method'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "string" — not a call expression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'string', loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'String' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "string" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('string', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "STRING" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('STRING', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "Stringy"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('Stringy', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log() — unrelated function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('console', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for myFunc() — custom function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('myFunc', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array(x) — different built-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('Array', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object(x) — different built-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('Object', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Symbol(x) — different built-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('Symbol', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Literal', value: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BigInt(x) — different built-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('BigInt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(x) — different built-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeCallNodeWithIdentifier('isNaN', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringWrapperRule.create(ctx1)
      const visitor2 = noUnnecessaryStringWrapperRule.create(ctx2)
      visitor1.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      visitor2.CallExpression(makeCallNodeWithIdentifier('Number', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNodeWithIdentifier('Number', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeStringCallNode([]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNodeWithIdentifier('Number', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNodeWithMemberCallee('obj', 'String'))
      visitor.CallExpression(makeStringCallNode([]))
      visitor.CallExpression(makeCallNodeWithIdentifier('Boolean', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringWrapperRule.create(context)
      const visitor2 = noUnnecessaryStringWrapperRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringWrapperRule.meta
      const meta2 = noUnnecessaryStringWrapperRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'x' }],
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
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      const node = makeStringCallNode([{ type: 'Identifier', name: 'x' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringWrapperRule).toBeDefined()
      expect(typeof noUnnecessaryStringWrapperRule.create).toBe('function')
      expect(typeof noUnnecessaryStringWrapperRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'x' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringWrapperRule.create(context)
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'a' }]))
      visitor.CallExpression(makeStringCallNode([{ type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

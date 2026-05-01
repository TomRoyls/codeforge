import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewNumberRule } from '../../../../src/rules/patterns/no-unnecessary-new-number.js'
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

function makeNewNumberNode(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Number' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-new-number rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewNumberRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewNumberRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewNumberRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryNewNumberRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewNumberRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Number', () => {
      const desc = noUnnecessaryNewNumberRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/number/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewNumberRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-new-number.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewNumberRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewNumberRule).toBeDefined()
      expect(noUnnecessaryNewNumberRule.meta).toBeDefined()
      expect(noUnnecessaryNewNumberRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports new Number()', () => {
    test('reports for new Number() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 3.14 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number("123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: '123' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(obj.prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(a, b) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number("hello", "world") with two string arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 'hello' }, { type: 'Literal', value: 'world' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions new Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      expect(reports[0].message).toMatch(/Number/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      expect(reports[0].message).toBe(
        'Unnecessary use of new Number(). Use a number literal instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      const node = makeNewNumberNode([])
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 42 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for new Number with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'MyClass' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Number with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Date' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Number' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Foo' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "number" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewNumberRule.create(ctx1)
      const visitor2 = noUnnecessaryNewNumberRule.create(ctx2)
      visitor1.NewExpression(makeNewNumberNode([]))
      visitor2.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 42 }]))
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewNumberRule.create(context)
      const visitor2 = noUnnecessaryNewNumberRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewNumberRule.meta
      const meta2 = noUnnecessaryNewNumberRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
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
      const visitor = noUnnecessaryNewNumberRule.create(context)
      const node = makeNewNumberNode([])
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewNumberRule).toBeDefined()
      expect(typeof noUnnecessaryNewNumberRule.create).toBe('function')
      expect(typeof noUnnecessaryNewNumberRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'factory' }, arguments: [] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression(makeNewNumberNode([]))
      visitor.NewExpression(makeNewNumberNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for new NUMBER (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'NUMBER' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Number_ (underscore suffix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number_' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyNumber', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyNumber' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "Number2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewNumberRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number2' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringReplaceSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-replace-spread.js'
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

function makeReplaceCallNode(
  object: unknown,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: 'replace' },
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

describe('no-unnecessary-string-replace-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning replace', () => {
      const desc = noUnnecessaryStringReplaceSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/replace/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-replace-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringReplaceSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringReplaceSpreadRule).toBeDefined()
      expect(noUnnecessaryStringReplaceSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringReplaceSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports str.replace(...items)', () => {
    test('reports for str.replace(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace(...arr) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replace(...[a, b]) with inline array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.str.replace(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".replace(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Literal', value: 'hello' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().replace(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions replace and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/replace/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'str.replace(...items) with spread is unusual. replace() expects a pattern and replacement.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      const node = makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for template literal object — `hello`.replace(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained replace — str.replace(/a/, "b").replace(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: { type: 'Identifier', name: 'replace' }, computed: false }, arguments: [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: 'b' }] },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArgs' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'args' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg(null)]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.replace(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'ThisExpression' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for super.replace(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Super' }, [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.replace(a, b) — two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(a, b, c) — three regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: 'b' }, { type: 'Literal', value: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(a) — one non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /a/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trim' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for replace(...items) — function call, not member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'replace' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replace' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are two arguments including one spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg(), { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are three arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg(), { type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /pattern/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "Replace" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'Replace' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "replaceAll"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(/regex/, "replacement") — normal usage', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /hello/ }, { type: 'Literal', value: 'world' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("hello", "world") — normal usage', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: 'hello' }, { type: 'Literal', value: 'world' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringReplaceSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      visitor2.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: 'b' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
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
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /x/ }]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringReplaceSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringReplaceSpreadRule.meta
      const meta2 = noUnnecessaryStringReplaceSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
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
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
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
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      const node = makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringReplaceSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringReplaceSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringReplaceSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
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
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg()]))
      visitor.CallExpression(makeReplaceCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'Identifier', name: 'opts' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when computed member expression with bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replace' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

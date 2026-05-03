import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringMatchAllSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-match-all-spread.js'
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

function makeMatchAllCallNode(
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
      property: { type: 'Identifier', name: 'matchAll' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-match-all-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning matchAll', () => {
      const desc = noUnnecessaryStringMatchAllSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/matchall/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-match-all-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule).toBeDefined()
      expect(noUnnecessaryStringMatchAllSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringMatchAllSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary matchAll spread', () => {
    test('reports for str.matchAll(...items) with spread identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.matchAll(...arr) with spread array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for text.matchAll(...regexes) with different object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'Identifier', name: 'regexes' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal string.matchAll(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Literal', value: 'hello' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.matchAll(...items) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().matchAll(...args) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions matchAll and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/matchAll/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'str.matchAll(...items) with spread is unusual. matchAll() expects a regular expression.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      const node = makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of member expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'regexes' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of call expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getRegexes' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of conditional expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 's' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: /a/ }, { type: 'Literal', value: /b/ }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.matchAll(...items) — nested object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode(
        { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for template literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of arrow function result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for computed:false member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.matchAll(regex) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'regex' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(/pattern/) — literal regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /pattern/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.matchAll(a, b) — two non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "matchall" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchall' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'matchAll' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'matchAll' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 2 elements with first being spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is not a SpreadElement (is Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'regex' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /test/g }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getRegex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'regex' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })



    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee computed is true with Identifier property named matchAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is SpreadElement but there are multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringMatchAllSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringMatchAllSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'regex' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'regex' }]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'regex' }]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, []))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringMatchAllSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringMatchAllSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringMatchAllSpreadRule.meta
      const meta2 = noUnnecessaryStringMatchAllSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      const node = makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringMatchAllSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringMatchAllSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringMatchAllSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMatchAllCallNode({ type: 'Identifier', name: 'text' }, [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when computed member expression with identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringMatchAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})

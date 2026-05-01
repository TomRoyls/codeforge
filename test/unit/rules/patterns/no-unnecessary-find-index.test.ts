import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryFindIndexRule } from '../../../../src/rules/patterns/no-unnecessary-find-index.js'
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
    getSource: () => '[].findIndex(x => x)',
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

function makeFindIndexCall(
  elements: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'ArrayExpression',
        elements,
      },
      property: {
        type: 'Identifier',
        name: 'findIndex',
      },
      computed: false,
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-find-index rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryFindIndexRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryFindIndexRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryFindIndexRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryFindIndexRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryFindIndexRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning findIndex', () => {
      const desc = noUnnecessaryFindIndexRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/findindex/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryFindIndexRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-find-index',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryFindIndexRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryFindIndexRule).toBeDefined()
      expect(noUnnecessaryFindIndexRule.meta).toBeDefined()
      expect(noUnnecessaryFindIndexRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary findIndex', () => {
    test('reports for empty array [].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with arrow function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for single number element [1].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single string element ["a"].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single boolean element [true].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single null element [null].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single object element [{}].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single nested array element [[]].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single zero element [0].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single string word ["hello"].findIndex(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single element with identifier callback argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for single element with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 42 }] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions ".findIndex()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0].message).toContain('.findIndex()')
    })

    test('report message mentions "0 or 1 elements"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0].message).toContain('0 or 1 elements')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0].message).toBe(
        'Unnecessary .findIndex() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      const node = makeFindIndexCall([])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      const node = makeFindIndexCall([])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'findIndex' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "find" not "findIndex"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "indexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property type is Literal (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Literal', value: 'findIndex' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Identifier (not ArrayExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'string' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2].findIndex(fn) — 2 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3].findIndex(fn) — 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ["a", "b"].findIndex(fn) — 2 string elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3, 4, 5].findIndex(fn) — 5 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
        { type: 'Literal', value: 4 },
        { type: 'Literal', value: 5 },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: null },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is string (not array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: 'bad' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryFindIndexRule.create(ctx1)
      const visitor2 = noUnnecessaryFindIndexRule.create(ctx2)
      visitor1.CallExpression(makeFindIndexCall([]))
      visitor2.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeFindIndexCall([]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 3 }]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryFindIndexRule.create(context)
      const visitor2 = noUnnecessaryFindIndexRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryFindIndexRule.meta
      const meta2 = noUnnecessaryFindIndexRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([]))
      visitor.CallExpression(makeFindIndexCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with arguments array still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(2, 4, 2, 24),
        range: [4, 24],
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when property name is "FILTER" (case sensitivity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'FILTER' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression(makeFindIndexCall([], 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('handles node with callee.computed = true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with callee.optional = true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindIndexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
          optional: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryFindIndexRule).toBeDefined()
      expect(typeof noUnnecessaryFindIndexRule.create).toBe('function')
      expect(typeof noUnnecessaryFindIndexRule.meta).toBe('object')
    })
  })
})

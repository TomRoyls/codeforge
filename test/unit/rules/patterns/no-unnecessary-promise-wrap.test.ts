import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseWrapRule } from '../../../../src/rules/patterns/no-unnecessary-promise-wrap.js'
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
    getSource: () => '',
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

function makePromiseWrapNode(
  methodName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Promise' },
    arguments: [
      {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Promise' },
        property: { type: 'Identifier', name: methodName },
      },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-wrap rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise', () => {
      const desc = noUnnecessaryPromiseWrapRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-promise-wrap',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseWrapRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseWrapRule).toBeDefined()
      expect(noUnnecessaryPromiseWrapRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseWrapRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY WRAP (25) =====

  describe('positive cases — reports unnecessary Promise wrap', () => {
    test('reports for new Promise(Promise.resolve())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.reject())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('reject'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.all())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('all'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.allSettled())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('allSettled'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.any())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('any'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.race())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('race'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.withResolvers())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('withResolvers'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary Promise wrapper"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0].message).toContain('Unnecessary Promise wrapper')
    })

    test('report message mentions "Promise method"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0].message).toContain('Promise method')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node contains the NewExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      const reportedNode = reports[0].node as Record<string, unknown>
      expect(reportedNode.type).toBe('NewExpression')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0].message).toBe(
        'Unnecessary Promise wrapper around Promise method.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      visitor.NewExpression(makePromiseWrapNode('reject'))
      expect(reports.length).toBe(2)
    })

    test('reports for new Promise(Promise.then())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('then'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.catch())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('catch'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Promise(Promise.finally())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('finally'))
      expect(reports.length).toBe(1)
    })

    test('reports for arbitrary method name on Promise object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('customMethod'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-letter method Promise.a()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric-like method Promise.resolve123()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve123'))
      expect(reports.length).toBe(1)
    })

    test('reports only once per node visit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports.length).toBe(1)
    })

    test('reports for method name that matches callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('Promise'))
      expect(reports.length).toBe(1)
    })

    test('reports when property has long method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('aVeryLongPromiseMethodName'))
      expect(reports.length).toBe(1)
    })

    test('reports for uppercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('RESOLVE'))
      expect(reports.length).toBe(1)
    })

    test('reports for method with underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('_internal'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 5, 10, 5, 40))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 5, 10, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 5, 10, 5, 40))
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      visitor.NewExpression(makePromiseWrapNode('reject'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects custom location values line 10 col 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc reflects custom location values end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 3, 8, 3, 20))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report node has callee with name Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      const reportedNode = reports[0].node as Record<string, unknown>
      const callee = reportedNode.callee as Record<string, unknown>
      expect(callee.name).toBe('Promise')
    })

    test('report node has arguments array with one element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      const reportedNode = reports[0].node as Record<string, unknown>
      const args = reportedNode.arguments as unknown[]
      expect(args.length).toBe(1)
    })

    test('report node argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      const reportedNode = reports[0].node as Record<string, unknown>
      const args = reportedNode.arguments as Record<string, unknown>[]
      expect(args[0].type).toBe('MemberExpression')
    })

    test('report node argument object name is Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      const reportedNode = reports[0].node as Record<string, unknown>
      const args = reportedNode.arguments as Record<string, unknown>[]
      const obj = args[0].object as Record<string, unknown>
      expect(obj.name).toBe('Promise')
    })

    test('report message does not contain interpolation artifacts', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      expect(reports[0].message).not.toContain('${')
      expect(reports[0].message).not.toContain('%s')
    })

    test('report for reject has same message as resolve', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseWrapRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseWrapRule.create(ctx2)
      visitor1.NewExpression(makePromiseWrapNode('resolve'))
      visitor2.NewExpression(makePromiseWrapNode('reject'))
      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      visitor.NewExpression(makePromiseWrapNode('all'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when callee name is not Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyPromise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'Promise' } },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments length is 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments length is 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } },
          { type: 'Literal', value: null },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg object name is not Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'NotPromise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg object type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: null,
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: null, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseWrapRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseWrapRule.create(ctx2)
      visitor1.NewExpression(makePromiseWrapNode('resolve'))
      visitor2.NewExpression({ type: 'Literal', value: 'test' })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      visitor.NewExpression({ type: 'Literal', value: 'test' })
      visitor.NewExpression(makePromiseWrapNode('reject'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve'))
      visitor.NewExpression({ type: 'Literal', value: 'x' })
      visitor.NewExpression({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Promise' }, arguments: [] })
      visitor.NewExpression(makePromiseWrapNode('reject'))
      visitor.NewExpression({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }] })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseWrapRule.create(context)
      const visitor2 = noUnnecessaryPromiseWrapRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseWrapRule.meta
      const meta2 = noUnnecessaryPromiseWrapRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      const node = makePromiseWrapNode('resolve')
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseWrapRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseWrapRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseWrapRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where callee is a string instead of object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: 'Promise',
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where arg object is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: 'Promise', property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with arguments.length === 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseWrapRule.create(context)
      visitor.NewExpression(makePromiseWrapNode('resolve', 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })
  })
})

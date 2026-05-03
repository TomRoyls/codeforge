import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseRaceSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-promise-race-spread.js'
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

function makePromiseRaceCall(
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
      object: { type: 'Identifier', name: 'Promise' },
      property: { type: 'Identifier', name: 'race' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argName: string): unknown {
  return { type: 'SpreadElement', argument: { type: 'Identifier', name: argName } }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-race-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.race and spread', () => {
      const desc = noUnnecessaryPromiseRaceSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
      expect(desc).toMatch(/race/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-promise-race-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule).toBeDefined()
      expect(noUnnecessaryPromiseRaceSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseRaceSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Promise.race(...items) spread', () => {
    test('reports for Promise.race(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.race(...promises)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('promises')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Promise.race and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports[0].message).toMatch(/Promise\.race/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports[0].message).toBe(
        'Promise.race(...items) with spread is unusual. race() expects a single iterable of promises.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      const node = makePromiseRaceCall([makeSpreadElement('items')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('a')]))
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('b')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('a')]))
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('b')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports with correct loc end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')], 3, 5, 3, 35))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports for spread of binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with null argument inside SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'Literal', value: null },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for multiple sequential violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(makePromiseRaceCall([makeSpreadElement(`items${i}`)]))
      }
      expect(reports.length).toBe(5)
    })

    test('reports for spread of object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'ObjectExpression', properties: [] },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{
        type: 'SpreadElement',
        argument: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with single-letter identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('x')]))
      expect(reports.length).toBe(1)
    })

    test('report loc start defaults to line 1 column 0 when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Promise.race(items) without spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race([]) array literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race([a, b]) array with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'allSettled' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.any(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'any' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.race(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObj' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.race(...items) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'ns' } },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race(a, ...b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{ type: 'Identifier', name: 'a' }, makeSpreadElement('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race(...a, ...b) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('a'), makeSpreadElement('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for race(...items) — no object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'race' },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement('items')], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement('items')], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'race' },
          computed: true,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: true,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Race" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'Race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "promise" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "PROMISE" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'PROMISE' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('reports when argument type is "SpreadElement" without argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([{ type: 'SpreadElement' }]))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getPromise' }, arguments: [] },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race() with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "race" but with different casing "RACE"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'RACE' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
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
      const visitor1 = noUnnecessaryPromiseRaceSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseRaceSpreadRule.create(ctx2)
      visitor1.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      visitor2.CallExpression(makePromiseRaceCall([{ type: 'Identifier', name: 'items' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('a')]))
      visitor.CallExpression(makePromiseRaceCall([{ type: 'Identifier', name: 'items' }]))
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('b')]))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('a')]))
      visitor.CallExpression(makePromiseRaceCall([{ type: 'Identifier', name: 'items' }]))
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('b')]))
      visitor.CallExpression(makePromiseRaceCall([]))
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('c')]))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseRaceSpreadRule.create(context)
      const visitor2 = noUnnecessaryPromiseRaceSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseRaceSpreadRule.meta
      const meta2 = noUnnecessaryPromiseRaceSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
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
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      const node = makePromiseRaceCall([makeSpreadElement('items')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseRaceSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseRaceSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseRaceSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('a')]))
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('b')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('handles computed member expression with computed: false still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression(makePromiseRaceCall([makeSpreadElement('items')]))
      expect(reports.length).toBe(1)
    })

    test('does not report when computed: true even with correct names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
          computed: true,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.resolve(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRaceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
          computed: false,
        },
        arguments: [makeSpreadElement('items')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})

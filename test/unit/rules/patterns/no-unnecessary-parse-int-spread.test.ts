import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryParseIntSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-parse-int-spread.js'
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

function makeParseIntCallWithSpread(
  spreadArg: unknown = { type: 'Identifier', name: 'items' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'parseInt' },
    arguments: [{ type: 'SpreadElement', argument: spreadArg }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-parse-int-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parseInt', () => {
      const desc = noUnnecessaryParseIntSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parseint/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-parse-int-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryParseIntSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryParseIntSpreadRule).toBeDefined()
      expect(noUnnecessaryParseIntSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryParseIntSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports parseInt with spread', () => {
    test('reports for parseInt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...args) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'items' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...getItems()) with CallExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getItems' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions parseInt and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0].message).toMatch(/parseInt/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0].message).toBe(
        'parseInt(...items) with spread is unusual. parseInt() expects a string and optional radix.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      const node = makeParseIntCallWithSpread()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'x' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for parseInt(...empty)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'empty' }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...data) with spread of a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Literal', value: '42' }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        property: { type: 'Identifier', name: 'c' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...(condition ? x : y)) with ConditionalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'condition' },
        consequent: { type: 'Identifier', name: 'x' },
        alternate: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...template) with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...fn()) with function call as spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...arr) with spread of an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'ArrayExpression',
        elements: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...obj.prop) with MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: 'values' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...new Map()) with NewExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...yield x) with YieldExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...await x) with AwaitExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...args) with LogicalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...args) with BinaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...x) with UpdateExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...x) with UnaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for parseInt(...tag`str`) with TaggedTemplateExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      const node = makeParseIntCallWithSpread()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for parseInt("42") — string argument, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(str, 10) — two arguments, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Identifier', name: 'str' },
          { type: 'Literal', value: 10 },
        ],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(str) — identifier argument, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Identifier', name: 'str' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(...items) — different function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo(...items) — different function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(...items, 10) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
          { type: 'Literal', value: 10 },
        ],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(x, y, z) — three arguments, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
          { type: 'Identifier', name: 'z' },
        ],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(x, ...rest) — first arg not spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
        ],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee name "parseint" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseint' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee name "ParseInt" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ParseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Identifier', name: 'items' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {},
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'IfStatement',
        test: {},
        consequent: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor1 = noUnnecessaryParseIntSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryParseIntSpreadRule.create(ctx2)
      visitor1.CallExpression(makeParseIntCallWithSpread())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mix of valid and invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'other' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'other' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryParseIntSpreadRule.create(context)
      const visitor2 = noUnnecessaryParseIntSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryParseIntSpreadRule.meta
      const meta2 = noUnnecessaryParseIntSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryParseIntSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryParseIntSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryParseIntSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'items' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeParseIntCallWithSpread({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message mentions unusual', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0].message).toMatch(/unusual/)
    })

    test('report message mentions radix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression(makeParseIntCallWithSpread())
      expect(reports[0].message).toMatch(/radix/)
    })

    test('does not report when argument type is empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{}],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('handles arguments array with undefined first element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('handles callee identifier with no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })
  })
})

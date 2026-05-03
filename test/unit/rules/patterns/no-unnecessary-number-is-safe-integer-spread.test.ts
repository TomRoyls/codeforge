import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberIsSafeIntegerSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-is-safe-integer-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

function makeCallNode(
  objectName: string,
  methodName: string,
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
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-is-safe-integer-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning isSafeInteger', () => {
      const desc = noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/issafeinteger/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-is-safe-integer-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Number.isSafeInteger spread', () => {
    test('reports for Number.isSafeInteger(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isSafeInteger(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isSafeInteger(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isSafeInteger(...obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'obj' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isSafeInteger(...getValue())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions isSafeInteger', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/isSafeInteger/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'Number.isSafeInteger(...items) with spread is unusual. isSafeInteger() expects a single value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      const node = makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for SpreadElement with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with different loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports for SpreadElement with SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number.isSafeInteger(x) — non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isSafeInteger(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isSafeInteger() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isSafeInteger(x, y, z) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.isSafeInteger(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Math', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String.isSafeInteger(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.isSafeInteger(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.isSafeInteger(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('foo', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isInteger(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isFinite', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isNaN', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseFloat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'parseFloat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'parseInt', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isSafeInteger(...items) — direct call, no member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isSafeInteger' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Number' } },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "number" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('number', 'isSafeInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "issafeinteger" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'issafeinteger', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getNumber' }, arguments: [] },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a regular Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode('Math', 'isSafeInteger', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'vals' })]))
      visitor.CallExpression(makeCallNode('Number', 'isInteger', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberIsSafeIntegerSpreadRule.meta
      const meta2 = noUnnecessaryNumberIsSafeIntegerSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
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
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
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
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      const node = makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberIsSafeIntegerSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberIsSafeIntegerSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberIsSafeIntegerSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isSafeInteger' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode('Number', 'isSafeInteger', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when object is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsSafeIntegerSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isSafeInteger' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

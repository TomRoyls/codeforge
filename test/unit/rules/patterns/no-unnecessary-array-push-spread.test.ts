import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayPushSpreadRule } from '../../../../src/rules/patterns/index.js'
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

function makePushCallNode(
  object: unknown,
  args: unknown[],
  computed = false,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed,
      object,
      property: { type: 'Identifier', name: 'push' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-push-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning push', () => {
      const desc = noUnnecessaryArrayPushSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/push/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-push-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayPushSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayPushSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayPushSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayPushSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports push with single spread argument', () => {
    test('reports arr.push(...items) with Identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports arr.push(...otherArr) with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'myArr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'otherArr' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports list.push(...elements) with list as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'list' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'elements' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'data' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with object being MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with object being ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'ArrayExpression', elements: [] },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing a function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'target' },
        [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'source' }, property: { type: 'Identifier', name: 'filter' } }, arguments: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions push and concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].message).toMatch(/push/)
      expect(reports[0].message).toMatch(/concat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].message).toBe(
        'arr.push(...items) can be replaced with arr.push(...items) but consider using arr.concat(items) for clarity.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      const node = makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        false, 5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'a' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'b' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'y' } }],
      ))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'a' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'b' },
        [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } }],
      ))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports push with SpreadElement containing ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with object being a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: '...', prefix: true, argument: { type: 'Identifier', name: 'val' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'YieldExpression', argument: { type: 'Identifier', name: 'val' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with SpreadElement containing AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports push with object being ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'ThisExpression' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for push with regular identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'item' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for push with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for push with two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for push with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for push with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 42 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for push with string Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 'hello' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.pop(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'pop' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression arr["push"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        true,
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for push with spread and additional argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'push' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 1 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'item' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is ArrayExpression instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is CallExpression instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is MemberExpression instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Push" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'Push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "PUSH" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'PUSH' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has single null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [null],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayPushSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayPushSpreadRule.create(ctx2)
      visitor1.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor2.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'item' }],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'item' }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } }],
      ))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'item' }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 1 }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [],
      ))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayPushSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayPushSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayPushSpreadRule.meta
      const meta2 = noUnnecessaryArrayPushSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      const node = makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayPushSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayPushSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayPushSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        false, 10, 4, 10, 25,
      ))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'list' },
        [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } }],
      ))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments array has undefined element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [undefined],
      ))
      expect(reports.length).toBe(0)
    })

    test('handles deeply nested object as spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayPushSpreadRule.create(context)
      visitor.CallExpression(makePushCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }, arguments: [] } }],
      ))
      expect(reports.length).toBe(1)
    })
  })
})

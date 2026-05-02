import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayKeysSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-keys-spread.js'
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

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
  parentType = 'SpreadElement',
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    _parent: { type: parentType },
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-keys-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning keys', () => {
      const desc = noUnnecessaryArrayKeysSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/keys/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-keys-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayKeysSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayKeysSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayKeysSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayKeysSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports [...arr.keys()] spread', () => {
    test('reports for [...arr.keys()] with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for [...arr.keys()] with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for [...obj.arr.keys()] with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for [...getArr().keys()] with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for [...this.keys()] with ThisExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for [...new Array().keys()] with NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [] }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for array with elements [...[1,2,3].keys()]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      expect(reports[0].message).toMatch(/keys/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      expect(reports[0].message).toBe(
        '[...arr.keys()] creates an index array. Use Array.from({length: arr.length}, (_, i) => i) or [...Array(arr.length).keys()] instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'keys'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'keys'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'keys'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'keys'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread keys on chained member expression a.b.c.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      const innerMember = { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: innerMember, property: { type: 'Identifier', name: 'c' } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on LogicalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on TaggedTemplateExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports with custom location values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'keys'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'keys'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread keys on SequenceExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on AssignmentExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'ArrayExpression', elements: [] } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on ArrayExpression with single element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 42 }] }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on ParenthesizedExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'arr' } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on AwaitExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] } }, 'keys'))
      expect(reports.length).toBe(1)
    })

    test('reports for spread keys on UnaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'arr' } }, 'keys'))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.keys() without spread (no _parent)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.keys() with _parent not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for for..of arr.keys() — parent is ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 1, 0, 1, 10, 'ForOfStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.values() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.entries() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.sort() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'keys' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments length is not 0 (e.g. keys(1))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "key" (singular)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'key'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "KEYS" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'KEYS'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "keyz" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keyz'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5), _parent: { type: 'SpreadElement' } })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5), _parent: { type: 'SpreadElement' } })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5), _parent: { type: 'SpreadElement' } })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 1, 0, 1, 10, 'VariableDeclarator'))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 1, 0, 1, 10, 'CallExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 1, 0, 1, 10, 'AssignmentExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: undefined,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayKeysSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayKeysSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys', [], 1, 0, 1, 10, 'ExpressionStatement'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'keys'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'keys', [], 1, 0, 1, 10, 'ExpressionStatement'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'keys'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      // valid: no _parent
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'keys' }, computed: false },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      // invalid: SpreadElement parent
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'keys'))
      // valid: wrong method
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'values'))
      // invalid: SpreadElement parent
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'd' }, 'keys'))
      // valid: wrong parent type
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'e' }, 'keys', [], 1, 0, 1, 10, 'ForOfStatement'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayKeysSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayKeysSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayKeysSpreadRule.meta
      const meta2 = noUnnecessaryArrayKeysSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: {},
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayKeysSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayKeysSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayKeysSpreadRule.meta).toBe('object')
    })

    test('handles _parent SpreadElement with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement', argument: { type: 'CallExpression' }, extraProp: true },
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed member expression property (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayKeysSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'keys' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })
  })
})

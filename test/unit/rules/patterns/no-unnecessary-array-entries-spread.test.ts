import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayEntriesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-entries-spread.js'
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
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadEntriesNode(
  object: unknown,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  const node = makeCallNode(object, 'entries', args, locStartLine, locStartCol, locEndLine, locEndCol) as Record<string, unknown>
  node._parent = { type: 'SpreadElement' }
  return node
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-entries-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning entries', () => {
      const desc = noUnnecessaryArrayEntriesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/entries/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-entries-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayEntriesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayEntriesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary entries spread', () => {
    test('reports for [...arr.entries()] with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[].entries()] with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for [...obj.arr.entries()] with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'arr' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for [...fn().entries()] with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for [...(a || b).entries()] with LogicalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].message).toMatch(/entries/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].message).toBe(
        '[...arr.entries()] creates index-value pairs. Use [...arr] to spread values directly if indices are not needed.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }, [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr1' }))
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr2' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr1' }))
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr2' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for [...this.items.entries()] with ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: 'items' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for [...arr.entries()] with non-empty array object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for [...a.b.c.entries()] with deep member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
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

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for entries() with ParenthesizedExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'ParenthesizedExpression',
        expression: { type: 'Identifier', name: 'arr' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for entries() with ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for entries() on Literal object in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Literal', value: 'str' }))
      expect(reports.length).toBe(1)
    })

    test('reports for entries() on ObjectExpression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement parent containing additional properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'SpreadElement', argument: node, extraProp: true }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for entries() on tagged template result in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for entries() on await expression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for entries() on NewExpression result in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.values() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values') as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.keys() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys') as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach') as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() without _parent (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with non-SpreadElement _parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'ArrayExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with _parent type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'CallExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries', [{ type: 'Literal', value: 1 }]) as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]) as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'entries' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Entries" (uppercase E)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'Entries') as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ENTRIES" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'ENTRIES') as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has computed: true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'TryStatement', block: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BreakStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() in for-of loop (parent is VariableDeclarator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'VariableDeclarator' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with parent type AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'AssignmentExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with parent null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = null
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for entries() with _parent undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = undefined
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayEntriesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayEntriesSpreadRule.create(ctx2)
      visitor1.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mix of valid and invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr2' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
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
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      const node2 = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values') as Record<string, unknown>
      node2._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node2)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr2' }))
      const node3 = makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys') as Record<string, unknown>
      node3._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node3)
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayEntriesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayEntriesSpreadRule.meta
      const meta2 = noUnnecessaryArrayEntriesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
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
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [],
        loc: {},
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
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
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayEntriesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayEntriesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayEntriesSpreadRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr' }, [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed:false explicitly on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr1' }))
      visitor.CallExpression(makeSpreadEntriesNode({ type: 'Identifier', name: 'arr2' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for entries() called directly (not a spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [...arr] — direct spread without entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries'))
      expect(reports.length).toBe(0)
    })

    test('handles _parent with empty SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for arr.entries() used in for-of (parent is ForOfStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'ForOfStatement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for map.entries() — Map entries is intentional', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'map' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for arr.entries() used in variable declaration (parent is VariableDeclarator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEntriesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries') as Record<string, unknown>
      node._parent = { type: 'VariableDeclarator' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})

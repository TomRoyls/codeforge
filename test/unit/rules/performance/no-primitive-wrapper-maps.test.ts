import { describe, test, expect, vi } from 'vitest'
import {
  noPrimitiveWrapperMapsRule,
  default as defaultExport,
} from '../../../../src/rules/performance/no-primitive-wrapper-maps.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'new Map(Object.entries(obj))',
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

function createMapObjectEntriesNode(
  entriesArg: unknown = { type: 'Identifier', name: 'obj' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Map' },
    arguments: [
      {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [entriesArg],
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-primitive-wrapper-maps rule', () => {
  // ===== Meta tests (8) =====

  test('should have category performance', () => {
    expect(noPrimitiveWrapperMapsRule.meta.docs?.category).toBe('performance')
  })

  test('should have severity warn', () => {
    expect(noPrimitiveWrapperMapsRule.meta.severity).toBe('warn')
  })

  test('should have type suggestion', () => {
    expect(noPrimitiveWrapperMapsRule.meta.type).toBe('suggestion')
  })

  test('should have description mentioning Map', () => {
    expect(noPrimitiveWrapperMapsRule.meta.docs?.description).toContain('Map')
  })

  test('should have description mentioning Object.entries', () => {
    expect(noPrimitiveWrapperMapsRule.meta.docs?.description).toContain('Object.entries')
  })

  test('should have correct docs URL', () => {
    expect(noPrimitiveWrapperMapsRule.meta.docs?.url).toBe(
      'https://codeforge.dev/docs/rules/no-primitive-wrapper-maps',
    )
  })

  test('should have empty schema', () => {
    expect(noPrimitiveWrapperMapsRule.meta.schema).toEqual([])
  })

  test('should not be recommended', () => {
    expect(noPrimitiveWrapperMapsRule.meta.docs?.recommended).toBe(false)
  })

  // ===== Structure tests (2) =====

  test('create() returns visitor with NewExpression method', () => {
    const { context } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(visitor).toHaveProperty('NewExpression')
    expect(typeof visitor.NewExpression).toBe('function')
  })

  test('default export equals named export', () => {
    expect(defaultExport).toBe(noPrimitiveWrapperMapsRule)
  })

  // ===== Positive cases (20) =====

  test('reports new Map(Object.entries(obj))', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports.length).toBe(1)
  })

  test('reports with identifier arg myObj', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({ type: 'Identifier', name: 'myObj' }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with identifier arg config', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({ type: 'Identifier', name: 'config' }),
    )
    expect(reports.length).toBe(1)
  })

  test('message contains "Object directly"', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].message).toContain('Object directly')
  })

  test('message contains "new Map(Object.entries(obj))"', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].message).toContain('new Map(Object.entries(obj))')
  })

  test('message mentions "Object methods are faster"', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].message).toContain('Object methods are faster')
  })

  test('message mentions "string keys"', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].message).toContain('string keys')
  })

  test('report has loc property with start and end', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start).toBeDefined()
    expect(reports[0].loc?.end).toBeDefined()
  })

  test('report includes the original node', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node = createMapObjectEntriesNode()
    visitor.NewExpression(node)
    expect(reports[0].node).toBe(node)
  })

  test('reports at specific line and column', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode(undefined, 5, 10))
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('reports at default line 1 column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports with MemberExpression arg to entries', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'props' },
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with CallExpression arg to entries', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getData' },
        arguments: [],
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with ObjectExpression arg to entries', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({
        type: 'ObjectExpression',
        properties: [],
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with ArrayExpression arg to entries', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({
        type: 'ArrayExpression',
        elements: [],
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with ConditionalExpression arg to entries', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with Literal arg to entries', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(
      createMapObjectEntriesNode({ type: 'Literal', value: 'key' }),
    )
    expect(reports.length).toBe(1)
  })

  test('reports with empty entries arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(1)
  })

  test('multiple violations accumulate in same visitor', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode({ type: 'Identifier', name: 'a' }))
    visitor.NewExpression(createMapObjectEntriesNode({ type: 'Identifier', name: 'b' }))
    visitor.NewExpression(createMapObjectEntriesNode({ type: 'Identifier', name: 'c' }))
    expect(reports.length).toBe(3)
  })

  test('message is the exact expected string', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].message).toBe(
      'Use Object directly instead of new Map(Object.entries(obj)). Object methods are faster for string keys.',
    )
  })

  // ===== Negative cases (40) =====

  test('new Map() with no arguments does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map([]) ArrayExpression arg does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [{ type: 'ArrayExpression', elements: [] }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(iterable) Identifier arg does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [{ type: 'Identifier', name: 'iterable' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Set(Object.entries(obj)) does not report — wrong callee name', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Set' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('CallExpression node type does not report — not NewExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(Object.keys(obj)) does not report — wrong method', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'keys' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(Object.values(obj)) does not report — wrong method', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'values' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(someObj.entries(obj)) does not report — wrong object', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'someObj' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(MyObject.entries(obj)) does not report — different object name', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'MyObject' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 32 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(Object.entries(obj), extraArg) does not report — 2 args to Map', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
        { type: 'Identifier', name: 'extraArg' },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 42 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('null node does not throw', () => {
    const { context } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(() => visitor.NewExpression(null)).not.toThrow()
  })

  test('undefined node does not throw', () => {
    const { context } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(() => visitor.NewExpression(undefined)).not.toThrow()
  })

  test('string node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(() => visitor.NewExpression('not a node')).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('number node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(() => visitor.NewExpression(42)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('empty object node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({})
    expect(reports.length).toBe(0)
  })

  test('ArrowFunctionExpression type node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({ type: 'ArrowFunctionExpression' })
    expect(reports.length).toBe(0)
  })

  test('TemplateLiteral type node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({ type: 'TemplateLiteral' })
    expect(reports.length).toBe(0)
  })

  test('node without callee does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({ type: 'NewExpression' })
    expect(reports.length).toBe(0)
  })

  test('null callee does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({ type: 'NewExpression', callee: null })
    expect(reports.length).toBe(0)
  })

  test('MemberExpression callee on Map (not Identifier) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'globalThis' },
        property: { type: 'Identifier', name: 'Map' },
      },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('callee name not Map (WeakMap) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'WeakMap' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('arg callee not MemberExpression (Identifier) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'entries' },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('computed MemberExpression Object["entries"] does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Literal', value: 'entries' },
            computed: true,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 32 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('MemberExpression object not Identifier does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'window' },
              property: { type: 'Identifier', name: 'Object' },
            },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('MemberExpression property not Identifier (Literal) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Literal', value: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map([...Object.entries(obj)]) spread in array does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'ArrayExpression',
          elements: [
            {
              type: 'SpreadElement',
              argument: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'Object' },
                  property: { type: 'Identifier', name: 'entries' },
                  computed: false,
                },
                arguments: [{ type: 'Identifier', name: 'obj' }],
              },
            },
          ],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 38 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('node without arguments property does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
    })
    expect(reports.length).toBe(0)
  })

  test('empty arguments array does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('entries with property name "Entries" (capitalized) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'Entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('entries object name "object" (lowercase) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('Map callee name "map" (lowercase) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('entries callee with null object does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: null,
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('entries callee with null property does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: null,
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('null first argument to Map does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [null],
    })
    expect(reports.length).toBe(0)
  })

  test('new Map with 3 arguments does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 42 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('FunctionExpression type node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({ type: 'FunctionExpression' })
    expect(reports.length).toBe(0)
  })

  test('callee with MemberExpression object having no name does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: '' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(Object.defineProperties(obj)) does not report — wrong method', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'defineProperties' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 38 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('new Map(Object.assign(obj)) does not report — wrong method name', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'assign' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('Object.entries used standalone does not report — not NewExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Object' },
        property: { type: 'Identifier', name: 'entries' },
        computed: false,
      },
      arguments: [{ type: 'Identifier', name: 'obj' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== Edge cases (15) =====

  test('separate create() calls have independent state', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = noPrimitiveWrapperMapsRule.create(ctx1)
    const visitor2 = noPrimitiveWrapperMapsRule.create(ctx2)

    visitor1.NewExpression(createMapObjectEntriesNode())
    visitor2.NewExpression({ type: 'NewExpression' })

    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('visitor accumulates reports across calls', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode({ type: 'Identifier', name: 'a' }))
    visitor.NewExpression(createMapObjectEntriesNode({ type: 'Identifier', name: 'b' }))
    expect(reports.length).toBe(2)
  })

  test('node without loc still reports with default location', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('report loc end values are preserved', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode(undefined, 3, 5))
    expect(reports[0].loc?.end.line).toBe(3)
    expect(reports[0].loc?.end.column).toBe(35)
  })

  test('report descriptor has correct structure', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node = createMapObjectEntriesNode()
    visitor.NewExpression(node)
    expect(reports[0]).toHaveProperty('message')
    expect(reports[0]).toHaveProperty('loc')
    expect(reports[0]).toHaveProperty('node')
    expect(typeof reports[0].message).toBe('string')
  })

  test('create() returns new visitor each call', () => {
    const { context } = createMockContext()
    const visitor1 = noPrimitiveWrapperMapsRule.create(context)
    const visitor2 = noPrimitiveWrapperMapsRule.create(context)
    expect(visitor1).not.toBe(visitor2)
  })

  test('boolean node does not throw or report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(() => visitor.NewExpression(true)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('Array node does not throw or report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(() => visitor.NewExpression([1, 2, 3])).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('node with only loc property does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression({ loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } } })
    expect(reports.length).toBe(0)
  })

  test('entries CallExpression with no callee does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('entries callee is CallExpression (not MemberExpression) does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getEntries' },
            arguments: [],
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('Map callee as MemberExpression does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ns' },
        property: { type: 'Identifier', name: 'Map' },
      },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'obj' }],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('specific location values are correctly passed through', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [{ type: 'Identifier', name: 'data' }],
        },
      ],
      loc: { start: { line: 42, column: 7 }, end: { line: 42, column: 38 } },
    }
    visitor.NewExpression(node)
    expect(reports[0].loc?.start.line).toBe(42)
    expect(reports[0].loc?.start.column).toBe(7)
    expect(reports[0].loc?.end.line).toBe(42)
    expect(reports[0].loc?.end.column).toBe(38)
  })

  test('entries with multiple arguments still reports', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Object' },
            property: { type: 'Identifier', name: 'entries' },
            computed: false,
          },
          arguments: [
            { type: 'Identifier', name: 'obj' },
            { type: 'Identifier', name: 'extra' },
          ],
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 38 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports only once per matching node call', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node = createMapObjectEntriesNode()
    visitor.NewExpression(node)
    expect(reports.length).toBe(1)
  })

  // ===== Additional tests (10) =====

  test('description mentions "Discourage"', () => {
    expect(noPrimitiveWrapperMapsRule.meta.docs?.description).toContain('Discourage')
  })

  test('meta has docs property', () => {
    expect(noPrimitiveWrapperMapsRule.meta).toHaveProperty('docs')
    expect(noPrimitiveWrapperMapsRule.meta.docs).toBeDefined()
  })

  test('meta has schema property', () => {
    expect(noPrimitiveWrapperMapsRule.meta).toHaveProperty('schema')
  })

  test('create returns an object', () => {
    const { context } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(typeof visitor).toBe('object')
    expect(visitor).not.toBeNull()
  })

  test('NewExpression visitor is a function', () => {
    const { context } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    expect(typeof visitor.NewExpression).toBe('function')
  })

  test('report message is a non-empty string', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    visitor.NewExpression(createMapObjectEntriesNode())
    expect(reports[0].message).toBeTruthy()
    expect(reports[0].message.length).toBeGreaterThan(0)
  })

  test('report node matches input node exactly', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node = createMapObjectEntriesNode()
    visitor.NewExpression(node)
    expect(reports[0].node).toBe(node)
    expect(reports.length).toBe(1)
  })

  test('new Map(Object.entries) without calling entries does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noPrimitiveWrapperMapsRule.create(context)
    const node: unknown = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Map' },
      arguments: [
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
    }
    visitor.NewExpression(node)
    expect(reports.length).toBe(0)
  })

  test('rule definition has create method', () => {
    expect(typeof noPrimitiveWrapperMapsRule.create).toBe('function')
  })

  test('rule definition has meta property', () => {
    expect(noPrimitiveWrapperMapsRule).toHaveProperty('meta')
    expect(typeof noPrimitiveWrapperMapsRule.meta).toBe('object')
  })
})

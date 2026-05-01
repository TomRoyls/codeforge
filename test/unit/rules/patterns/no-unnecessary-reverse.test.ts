import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReverseRule } from '../../../../src/rules/patterns/no-unnecessary-reverse.js'
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
    getSource: () => '[].reverse()',
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

function makeArrayExpression(elements: unknown[]): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: makeLoc(1, 0, 1, 10),
  }
}

function makeCallExpression(objectNode: unknown, methodName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: objectNode,
      property: {
        type: 'Identifier',
        name: methodName,
      },
    },
    arguments: [],
    loc: makeLoc(1, 0, 1, 10),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name, loc: makeLoc(1, 0, 1, 5) }
}

describe('no-unnecessary-reverse rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReverseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReverseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReverseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReverseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReverseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning reverse', () => {
      const desc = noUnnecessaryReverseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reverse/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReverseRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-reverse',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReverseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReverseRule).toBeDefined()
      expect(noUnnecessaryReverseRule.meta).toBeDefined()
      expect(noUnnecessaryReverseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY REVERSE (43) =====

  describe('positive cases — reports unnecessary reverse', () => {
    test('reports for [].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports.length).toBe(1)
    })

    test('reports for [1].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ["hello"].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'hello' }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [true].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: true }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [null].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: null }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [42].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 42 }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [""].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: '' }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [0].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 0 }]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [{}].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'ObjectExpression', properties: [] }]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [[]].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'ArrayExpression', elements: [] }]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [identifier].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([makeIdentifier('x')]), 'reverse'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [callExpr()].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'CallExpression', callee: {}, arguments: [] }]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [a + b].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [!a].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'UnaryExpression', operator: '!', prefix: true, argument: {} },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [fn()].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions ".reverse()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0].message).toContain('.reverse()')
    })

    test('report message mentions "0 or 1 elements"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0].message).toContain('0 or 1 elements')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0].message).toBe(
        'Unnecessary .reverse() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'reverse')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc preserves custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const arr = makeArrayExpression([])
      const node = makeCallExpression(arr, 'reverse')
      ;(node as Record<string, unknown>).loc = makeLoc(5, 10, 5, 25)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'reverse'),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'reverse'),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'reverse' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'reverse')
      ;(node as Record<string, unknown>)._parent = {}
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'reverse')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'reverse' },
        },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'reverse')
      ;(node as Record<string, unknown>).loc = {}
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'reverse')
      ;(node as Record<string, unknown>).loc = { start: { line: 3, column: 5 } }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const arr = makeArrayExpression([])
      const node = makeCallExpression(arr, 'reverse')
      ;(node as Record<string, unknown>).loc = makeLoc(10, 4, 10, 20)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReverseRule.create(ctx1)
      const visitor2 = noUnnecessaryReverseRule.create(ctx2)
      visitor1.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      visitor2.CallExpression(
        makeCallExpression(
          makeArrayExpression([makeIdentifier('a'), makeIdentifier('b')]),
          'reverse',
        ),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReverseRule.create(context)
      const visitor2 = noUnnecessaryReverseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReverseRule.meta
      const meta2 = noUnnecessaryReverseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([makeIdentifier('a'), makeIdentifier('b')]),
          'reverse',
        ),
      )
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'reverse'),
      )
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([makeIdentifier('a'), makeIdentifier('b')]),
          'reverse',
        ),
      )
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'reverse'),
      )
      visitor.CallExpression(makeCallExpression(makeIdentifier('arr'), 'reverse'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports.length).toBe(3)
    })

    test('reports for [fn(){}].reverse() with function expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [() => {}].reverse() with arrow function element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [a ? b : c].reverse() with conditional expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [obj.prop].reverse() with member expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            {
              type: 'MemberExpression',
              object: makeIdentifier('obj'),
              property: makeIdentifier('prop'),
            },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReverseRule).toBeDefined()
      expect(typeof noUnnecessaryReverseRule.create).toBe('function')
      expect(typeof noUnnecessaryReverseRule.meta).toBe('object')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for [1, 2].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ["a", "b"].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3, 4, 5].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
            { type: 'Literal', value: 4 },
            { type: 'Literal', value: 5 },
          ]),
          'reverse',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reverse() with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeIdentifier('arr'), 'reverse'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.prop.reverse() with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const obj = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('prop'),
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.CallExpression(makeCallExpression(obj, 'reverse'))
      expect(reports.length).toBe(0)
    })

    test('does not report for func().reverse() with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      const funcCall = makeCallExpression(makeIdentifier('func'), 'something')
      visitor.CallExpression(makeCallExpression(funcCall, 'reverse'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].concat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'concat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].push()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'push'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].pop()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'pop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Literal', value: 'reverse' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "reverse"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'reverse' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) },
          'reverse',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: {},
        property: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
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
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {},
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
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
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        expression: {},
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReverseRule.create(context)
      visitor.CallExpression({
        type: 'ConditionalExpression',
        test: {},
        consequent: {},
        alternate: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryFlatRule } from '../../../../src/rules/patterns/no-unnecessary-flat.js'
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
    getSource: () => '[1].flat()',
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

function makeFlatCallNode(
  elements: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
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
        name: 'flat',
      },
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-unnecessary-flat rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryFlatRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryFlatRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryFlatRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryFlatRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryFlatRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning flat', () => {
      const desc = noUnnecessaryFlatRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('flat')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryFlatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-flat',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryFlatRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryFlatRule).toBeDefined()
      expect(noUnnecessaryFlatRule.meta).toBeDefined()
      expect(noUnnecessaryFlatRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====

  describe('positive cases — reports unnecessary flat', () => {
    test('reports for [1].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2, 3].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ["a", "b"].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [true, false].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: true },
          { type: 'Literal', value: false },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single string element ["hello"].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single number element [42].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array [].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports for mixed types [1, "a", true].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: true },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for many elements [1,2,3,4,5].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
          { type: 'Literal', value: 4 },
          { type: 'Literal', value: 5 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for Identifier elements [a, b].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for CallExpression elements [func()].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'func' }, arguments: [] },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression elements [{}].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with loc on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }], 3, 5, 3, 15))
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('reports with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: 1 }],
          },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [null].flat() with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([null]))
      expect(reports.length).toBe(1)
    })

    test('reports for sparse array with undefined elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([undefined, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1].flat() with specific loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }], 7, 2, 7, 12))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('reports for large flat array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const elements = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeFlatCallNode(elements))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2, 3].flat() multi elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single Literal with zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1].flat() with custom end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }], 1, 0, 5, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('reports for [].flat() empty elements array still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports for MemberExpression elements [a.b].flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains ".flat()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toContain('.flat()')
    })

    test('report message exact match', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toBe(
        'Unnecessary .flat() call on an array with no nested arrays.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const node = makeFlatCallNode([{ type: 'Literal', value: 1 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }], 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulation across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('consistent messages across reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 'a' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report message mentions "nested arrays"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message.toLowerCase()).toContain('nested arrays')
    })

    test('report message is non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('multiple violations accumulate correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeFlatCallNode([]))
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for [[1, 2]].flat() with nested array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, [2, 3]].flat() mixed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 1 },
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property not "flat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for object is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node type not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "flatMap"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flatMap' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for [[[1]]].flat() deeply nested', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          {
            type: 'ArrayExpression',
            elements: [
              { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
            ],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [[], 1].flat() empty nested array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'ArrayExpression', elements: [] },
          { type: 'Literal', value: 1 },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee being Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'flat' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Literal', value: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: undefined,
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object callee (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'not-an-object',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: {},
        property: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: 'not-array' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
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
      const visitor1 = noUnnecessaryFlatRule.create(ctx1)
      const visitor2 = noUnnecessaryFlatRule.create(ctx2)
      visitor1.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'ArrayExpression', elements: [] }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'ArrayExpression', elements: [] }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([{ type: 'ArrayExpression', elements: [] }]),
      )
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeFlatCallNode([]))
      visitor.CallExpression(
        makeFlatCallNode([{ type: 'Literal', value: 1 }, { type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryFlatRule.create(context)
      const visitor2 = noUnnecessaryFlatRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryFlatRule.meta
      const meta2 = noUnnecessaryFlatRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: 1 }],
          },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        flags: 'test',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      const node = makeFlatCallNode([{ type: 'Literal', value: 1 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryFlatRule).toBeDefined()
      expect(typeof noUnnecessaryFlatRule.create).toBe('function')
      expect(typeof noUnnecessaryFlatRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with arguments array having values still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Literal', value: 2 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([{ type: 'Literal', value: 1 }], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('handles elements containing undefined values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([undefined, undefined]))
      expect(reports.length).toBe(1)
    })

    test('handles elements containing null values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([null, null]))
      expect(reports.length).toBe(1)
    })

    test('elements array containing mixed null and objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(makeFlatCallNode([null, { type: 'Literal', value: 1 }, undefined]))
      expect(reports.length).toBe(1)
    })

    test('does not report when elements has nested ArrayExpression at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFlatRule.create(context)
      visitor.CallExpression(
        makeFlatCallNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'ArrayExpression', elements: [] },
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })
})

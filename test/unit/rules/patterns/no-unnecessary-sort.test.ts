import { describe, expect, test, vi } from 'vitest'
import { noUnnecessarySortRule } from '../../../../src/rules/patterns/no-unnecessary-sort.js'
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
    getSource: () => '[].sort()',
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

function makeCallExpression(objectNode: unknown, methodName: string, loc?: ReturnType<typeof makeLoc>): unknown {
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
    loc: loc ?? makeLoc(1, 0, 1, 10),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-sort rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessarySortRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessarySortRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessarySortRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySortRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessarySortRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning sort', () => {
      const desc = noUnnecessarySortRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/sort/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessarySortRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-sort',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessarySortRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessarySortRule).toBeDefined()
      expect(noUnnecessarySortRule.meta).toBeDefined()
      expect(noUnnecessarySortRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — EMPTY ARRAY (8) =====

  describe('positive cases — empty array .sort()', () => {
    test('reports for [].sort() — empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports exactly one violation for empty array .sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains ".sort()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0].message).toContain('.sort()')
    })

    test('report message contains "0 or 1 elements"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0].message).toContain('0 or 1 elements')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0].node).toBeDefined()
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0].message).toBe(
        'Unnecessary .sort() call on an array with 0 or 1 elements.',
      )
    })
  })

  // ===== POSITIVE CASES — SINGLE ELEMENT (15) =====

  describe('positive cases — single element .sort()', () => {
    test('reports for [1].sort() — numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for ["a"].sort() — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'a' }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [true].sort() — boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: true }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [null].sort() — null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: null }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [x].sort() — identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Identifier', name: 'x' }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [[]].sort() — nested empty array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ArrayExpression', elements: [] }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [{}].sort() — object expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ObjectExpression', properties: [] }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for single FunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for single ArrowFunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [this].sort() — ThisExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ThisExpression' }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for [1+2].sort() — BinaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for single UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for single TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for single regex literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }]), 'sort'))
      expect(reports.length).toBe(1)
    })

    test('reports for single ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }]), 'sort'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — REPORT DETAILS (10) =====

  describe('positive cases — report details', () => {
    test('report loc start values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort', makeLoc(5, 10, 5, 20))
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort', makeLoc(5, 10, 7, 15))
      visitor.CallExpression(node)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'sort'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'sort'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) },
          property: { type: 'Identifier', name: 'sort' },
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
      const visitor = noUnnecessarySortRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'sort')
      const nodeWithParent = { ...node, _parent: {} }
      visitor.CallExpression(nodeWithParent)
      expect(reports.length).toBe(1)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'sort' },
        },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed empty and single element arrays both report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'x' }]), 'sort'))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — TWO OR MORE ELEMENTS (12) =====

  describe('negative cases — two or more elements', () => {
    test('does not report for [1, 2].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ["a", "b"].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for mixed types [1, "a", true].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 'a' }, { type: 'Literal', value: true }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for large array with 10 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const elements = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallExpression(makeArrayExpression(elements), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [null, null].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: null }, { type: 'Literal', value: null }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3, 4, 5].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const elements = [1, 2, 3, 4, 5].map(v => ({ type: 'Literal', value: v }))
      visitor.CallExpression(makeCallExpression(makeArrayExpression(elements), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [[], []].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ArrayExpression', elements: [] }, { type: 'ArrayExpression', elements: [] }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [{}, {}].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'ObjectExpression', properties: [] }, { type: 'ObjectExpression', properties: [] }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [x, y].sort() identifier elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for many string elements ["a","b","c","d"].sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      const elements = ['a', 'b', 'c', 'd'].map(v => ({ type: 'Literal', value: v }))
      visitor.CallExpression(makeCallExpression(makeArrayExpression(elements), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three different element types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([
        { type: 'Literal', value: 1 },
        { type: 'Identifier', name: 'x' },
        { type: 'ArrayExpression', elements: [] },
      ]), 'sort'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NON-ARRAY OBJECT (10) =====

  describe('negative cases — non-array object', () => {
    test('does not report for variable.sort() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'Identifier', name: 'arr' }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.prop.sort() — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'CallExpression', callee: {}, arguments: [] }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'ObjectExpression', properties: [] }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'NewExpression', callee: {}, arguments: [] }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {} }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }, 'sort'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NON-SORT METHOD (8) =====

  describe('negative cases — non-sort method', () => {
    test('does not report for [].map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].push()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'push'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reverse'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].indexOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'indexOf'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — MALFORMED NODES (8) =====

  describe('negative cases — malformed nodes', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (14) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessarySortRule.create(ctx1)
      const visitor2 = noUnnecessarySortRule.create(ctx2)
      visitor1.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor2.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'sort'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessarySortRule.create(context)
      const visitor2 = noUnnecessarySortRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessarySortRule.meta
      const meta2 = noUnnecessarySortRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 5 }]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }, { type: 'Literal', value: 'c' }]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      expect(reports.length).toBe(3)
    })

    test('separate visitors share no state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessarySortRule.create(ctx1)
      const visitor2 = noUnnecessarySortRule.create(ctx2)
      visitor1.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor1.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor2.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'sort'))
      expect(rep1.length).toBe(2)
      expect(rep2.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessarySortRule).toBeDefined()
      expect(typeof noUnnecessarySortRule.create).toBe('function')
      expect(typeof noUnnecessarySortRule.meta).toBe('object')
    })

    test('visitor accumulates correctly across mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'sort'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'map'))
      visitor.CallExpression(makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 1 }]), 'sort'))
      expect(reports.length).toBe(2)
    })

    test('does not report when callee type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'sort' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Literal', value: 'sort' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "sort"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'sorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'ArrayExpression', elements: 'not-array' }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression(makeCallExpression({ type: 'ArrayExpression' }, 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression type but missing callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySortRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })
})

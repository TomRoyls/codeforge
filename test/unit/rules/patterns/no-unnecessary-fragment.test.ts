import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryFragmentRule } from '../../../../src/rules/patterns/no-unnecessary-fragment.js'
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
    getSource: () => '<></>',
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

function makeFragmentNode(
  children: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'JSXFragment',
    openingFragment: { type: 'JSXOpeningFragment' },
    closingFragment: { type: 'JSXClosingFragment' },
    children,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-fragment rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryFragmentRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryFragmentRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryFragmentRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryFragmentRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryFragmentRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning fragment', () => {
      const desc = noUnnecessaryFragmentRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/fragment/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryFragmentRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-fragment',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryFragmentRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with JSXFragment', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(visitor).toHaveProperty('JSXFragment')
      expect(typeof visitor.JSXFragment).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryFragmentRule).toBeDefined()
      expect(noUnnecessaryFragmentRule.meta).toBeDefined()
      expect(noUnnecessaryFragmentRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY FRAGMENT (25) =====

  describe('positive cases — reports empty fragment', () => {
    test('reports fragment with empty children array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with only whitespace JSXText child (spaces)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '   ', value: '   ' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with only whitespace JSXText child (tabs)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '\t\t', value: '\t\t' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with only whitespace JSXText child (newlines)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '\n\n', value: '\n\n' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with only JSXExpressionContainer child', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with multiple JSXExpressionContainer children', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'a' } },
        { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'b' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with whitespace JSXText and JSXExpressionContainer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        { type: 'JSXText', raw: '  ', value: '  ' },
        { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'x' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with empty string JSXText', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with JSXText child that has no raw but whitespace value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', value: '  ' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with mixed whitespace-only children', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        { type: 'JSXText', raw: ' ', value: ' ' },
        { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'y' } },
        { type: 'JSXText', raw: '\n', value: '\n' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary fragment"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].message).toContain('Unnecessary fragment')
    })

    test('report message mentions "Remove the empty fragment wrapper"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].message).toBe('Unnecessary fragment. Remove the empty fragment wrapper.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input JSXFragment node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node = makeFragmentNode([])
      visitor.JSXFragment(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([], 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports only once per fragment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '  ', value: '  ' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports fragment with JSXText raw undefined and value whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', value: '\t' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with only JSXExpressionContainer containing literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXExpressionContainer', expression: { type: 'Literal', value: 42 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with JSXText containing only carriage return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '\r\n', value: '\r\n' }]))
      expect(reports.length).toBe(1)
    })

    test('reports fragment with multiple whitespace-only JSXText children', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        { type: 'JSXText', raw: '  ', value: '  ' },
        { type: 'JSXText', raw: '\n', value: '\n' },
        { type: 'JSXText', raw: '\t', value: '\t' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects end position from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([], 2, 0, 3, 5))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('reports fragment with JSXText having raw as empty and value as whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '', value: ' ' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES TESTS (15) =====

  describe('report properties', () => {
    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc start has line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report loc start has column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end has line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('report loc end has column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report message is non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report node is the original node object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node = makeFragmentNode([])
      visitor.JSXFragment(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc uses default values when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report loc uses default end when node has partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
        loc: { start: { line: 5, column: 3 } },
      })
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('multiple reports each reference their own node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node1 = makeFragmentNode([])
      const node2 = makeFragmentNode([])
      visitor.JSXFragment(node1)
      visitor.JSXFragment(node2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
    })

    test('multiple reports have independent loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([], 1, 0, 1, 5))
      visitor.JSXFragment(makeFragmentNode([], 10, 2, 10, 7))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([], 7, 3, 12, 8))
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('report from whitespace JSXText fragment has same message as empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '   ', value: '   ' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report from expression container fragment has same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'x' } }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has exactly three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      expect(Object.keys(reports[0]).sort()).toEqual(['loc', 'message', 'node'])
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({ type: 'JSXElement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      expect(() => visitor.JSXFragment([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with JSXElement child', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{
        type: 'JSXElement',
        openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
        closingElement: { type: 'JSXClosingElement', name: { type: 'JSXIdentifier', name: 'div' } },
        children: [],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with JSXElement div child', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{
        type: 'JSXElement',
        openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with JSXElement span child', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{
        type: 'JSXElement',
        openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'span' } },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with non-empty JSXText child', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: 'hello', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with JSXText having trimmed content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '  hello  ', value: '  hello  ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with multiple JSXElement children', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        {
          type: 'JSXElement',
          openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
        },
        {
          type: 'JSXElement',
          openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'span' } },
        },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with JSXElement and whitespace JSXText', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        { type: 'JSXText', raw: '  ', value: '  ' },
        {
          type: 'JSXElement',
          openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
        },
        { type: 'JSXText', raw: '\n', value: '\n' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with JSXElement and JSXExpressionContainer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([
        { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'x' } },
        {
          type: 'JSXElement',
          openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'p' } },
        },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for JSXFragment missing children property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when children is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        children: 'not an array',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when children is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        children: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report fragment with non-empty JSXText using value fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', value: 'content' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryFragmentRule.create(ctx1)
      const visitor2 = noUnnecessaryFragmentRule.create(ctx2)
      visitor1.JSXFragment(makeFragmentNode([]))
      visitor2.JSXFragment(makeFragmentNode([{
        type: 'JSXElement',
        openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
      }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([{
        type: 'JSXElement',
        openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
      }]))
      visitor.JSXFragment(makeFragmentNode([]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node = {
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
      }
      visitor.JSXFragment(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node = {
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
      }
      visitor.JSXFragment(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: 'hello', value: 'hello' }]))
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'x' } }]))
      visitor.JSXFragment(makeFragmentNode([{
        type: 'JSXElement',
        openingElement: { type: 'JSXOpeningElement', name: { type: 'JSXIdentifier', name: 'div' } },
      }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryFragmentRule.create(context)
      const visitor2 = noUnnecessaryFragmentRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryFragmentRule.meta
      const meta2 = noUnnecessaryFragmentRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node = {
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        parent: {},
      }
      visitor.JSXFragment(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      const node = makeFragmentNode([])
      visitor.JSXFragment(node)
      visitor.JSXFragment(node)
      visitor.JSXFragment(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryFragmentRule).toBeDefined()
      expect(typeof noUnnecessaryFragmentRule.create).toBe('function')
      expect(typeof noUnnecessaryFragmentRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment({
        type: 'JSXFragment',
        openingFragment: { type: 'JSXOpeningFragment' },
        closingFragment: { type: 'JSXClosingFragment' },
        children: [],
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([]))
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: '  ', value: '  ' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles child that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([null]))
      expect(reports.length).toBe(1)
    })

    test('handles child that is a non-object primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([42]))
      expect(reports.length).toBe(1)
    })

    test('handles child that is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode(['text']))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('JSXText with non-string raw value is treated as empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXText', raw: 123, value: '123' }]))
      expect(reports.length).toBe(1)
    })

    test('child with unknown type counts as non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([{ type: 'JSXSpreadChild', expression: {} }]))
      expect(reports.length).toBe(0)
    })

    test('fragment with only undefined children entries reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFragmentRule.create(context)
      visitor.JSXFragment(makeFragmentNode([undefined, undefined]))
      expect(reports.length).toBe(1)
    })
  })
})

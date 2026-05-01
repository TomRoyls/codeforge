import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryLastIndexOfRule } from '../../../../src/rules/patterns/no-unnecessary-last-index-of.js'
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
    getSource: () => '[].lastIndexOf(x)',
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

function makeArrayExpr(elements: unknown[]): unknown {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

function makeCallExpressionNode(
  objectNode: unknown,
  propertyName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: objectNode,
      property: { type: 'Identifier', name: propertyName },
      computed: false,
      optional: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-last-index-of rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning lastIndexOf', () => {
      const desc = noUnnecessaryLastIndexOfRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('lastindexof')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-last-index-of',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryLastIndexOfRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryLastIndexOfRule).toBeDefined()
      expect(noUnnecessaryLastIndexOfRule.meta).toBeDefined()
      expect(noUnnecessaryLastIndexOfRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY lastIndexOf (30) =====

  describe('positive cases — reports unnecessary lastIndexOf', () => {
    test('reports for empty array [].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports.length).toBe(1)
    })

    test('reports for single number element [1].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      expect(reports.length).toBe(1)
    })

    test('reports for single string element ["a"].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 'a' }]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single null element [null].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: null }]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single boolean element [true].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single identifier element [foo].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for nested array element [[]].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([{ type: 'ArrayExpression', elements: [] }]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for object element [{}].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for CallExpression element [fn()].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression element [1+2].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([
            { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } },
          ]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "lastIndexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0].message).toContain('lastIndexOf')
    })

    test('report message mentions "0 or 1 elements"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0].message).toContain('0 or 1 elements')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0].message).toBe(
        'Unnecessary .lastIndexOf() call on an array with 0 or 1 elements.',
      )
    })

    test('reports with string literal argument [].lastIndexOf("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', [{ type: 'Literal', value: 'a' }]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with number literal argument [].lastIndexOf(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', [{ type: 'Literal', value: 1 }]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with fromIndex argument [].lastIndexOf(x, 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', [
          { type: 'Identifier', name: 'x' },
          { type: 'Literal', value: 0 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with no arguments [].lastIndexOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', []))
      expect(reports.length).toBe(1)
    })

    test('reports with spread argument [].lastIndexOf(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single sparse array element [,].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([null]), 'lastIndexOf'))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunction element [() => 1].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 1 } }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression element [a ? b : c].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'a' },
            consequent: { type: 'Identifier', name: 'b' },
            alternate: { type: 'Identifier', name: 'c' },
          }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('accumulates three calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports.length).toBe(3)
    })

    test('reports for TemplateLiteral element [`hello`].lastIndexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for [1, 2].lastIndexOf(x) — two elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3].lastIndexOf(x) — three elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.lastIndexOf(x) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf'),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for a.b.lastIndexOf(x) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fn().lastIndexOf(x) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for (1).lastIndexOf(x) — Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode({ type: 'Literal', value: 1 }, 'lastIndexOf'),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for obj literal.lastIndexOf(x) — ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode({ type: 'ObjectExpression', properties: [] }, 'lastIndexOf'),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].indexOf(x) — indexOf not lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].includes(x) — includes not lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'includes'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(x) — find not lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: 'string', arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: makeArrayExpr([]) },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: makeArrayExpr([]), property: 'lastIndexOf' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'lastIndexOf' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([]), 'indexOf'),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing from callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: 'not-an-object',
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(fn) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode({ type: 'Identifier', name: 'arr' }, 'map'),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3, 4].lastIndexOf(x) — four elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
            { type: 'Literal', value: 4 },
          ]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [a, b].lastIndexOf(x) — two identifier elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]),
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].push(x) — push not lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'push'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].pop() — pop not lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'pop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          { type: 'ArrayExpression', elements: 'not-array' },
          'lastIndexOf',
        ),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryLastIndexOfRule.create(ctx1)
      const visitor2 = noUnnecessaryLastIndexOfRule.create(ctx2)
      visitor1.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor2.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
          'lastIndexOf',
        ),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
          'lastIndexOf',
        ),
      )
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(
          makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
          'lastIndexOf',
        ),
      )
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor.CallExpression(
        makeCallExpressionNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf'),
      )
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'indexOf'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryLastIndexOfRule.create(context)
      const visitor2 = noUnnecessaryLastIndexOfRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryLastIndexOfRule.meta
      const meta2 = noUnnecessaryLastIndexOfRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      Object.assign(node, { range: [0, 18], extra: true, trailingComments: [] })
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      Object.assign(node, { loc: {} })
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      Object.assign(node, { loc: { start: { line: 3, column: 5 } } })
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryLastIndexOfRule).toBeDefined()
      expect(typeof noUnnecessaryLastIndexOfRule.create).toBe('function')
      expect(typeof noUnnecessaryLastIndexOfRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf')
      Object.assign(node, { _parent: { type: 'ExpressionStatement' } })
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf'))
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'lastIndexOf'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with arguments alongside callee still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      const node = makeCallExpressionNode(
        makeArrayExpr([]),
        'lastIndexOf',
        [{ type: 'Identifier', name: 'x' }],
      )
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(makeCallExpressionNode(makeArrayExpr([]), 'lastIndexOf', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression with Literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'lastIndexOf' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles optional member expression — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'lastIndexOf' },
          computed: false,
          optional: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('handles sparse array with two holes — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLastIndexOfRule.create(context)
      visitor.CallExpression(
        makeCallExpressionNode(makeArrayExpr([null, null]), 'lastIndexOf'),
      )
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberTofixedZeroRule } from '../../../../src/rules/patterns/no-unnecessary-number-tofixed-zero.js'
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

// ===== META TESTS (8) =====

describe('no-unnecessary-number-tofixed-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toFixed', () => {
      const desc = noUnnecessaryNumberTofixedZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tofixed/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-tofixed-zero.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberTofixedZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberTofixedZeroRule).toBeDefined()
      expect(noUnnecessaryNumberTofixedZeroRule.meta).toBeDefined()
      expect(noUnnecessaryNumberTofixedZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — toFixed() NO ARGS (14) =====

  describe('positive cases — reports toFixed() without arguments', () => {
    test('reports for x.toFixed() — Identifier object, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for (42).toFixed() — Literal object, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for (3.14).toFixed() — decimal number, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 3.14 }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for result.toFixed() — result of function call, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.toFixed() — MemberExpression object, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for (0).toFixed() — zero value, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for (NaN).toFixed() — NaN, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'NaN' }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for num.toFixed() — variable, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('reports for (Infinity).toFixed() — Infinity, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Infinity' }, 'toFixed'))
      expect(reports.length).toBe(1)
    })

    test('report message for toFixed() without args mentions no digits argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      expect(reports[0].message).toMatch(/without digits argument/)
    })

    test('report message for toFixed() without args is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      expect(reports[0].message).toBe(
        'Unnecessary .toFixed() without digits argument. This is equivalent to .toFixed(0) but less explicit. Pass 0 explicitly for clarity.',
      )
    })

    test('report for toFixed() has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report for toFixed() has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      expect(reports[0].node).toBeDefined()
    })

    test('report for toFixed() node matches input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== POSITIVE CASES — toFixed(0) WITH ZERO ARG (14) =====

  describe('positive cases — reports toFixed(0)', () => {
    test('reports for x.toFixed(0) — Identifier object, Literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for (42).toFixed(0) — Literal object, Literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for (3.14).toFixed(0) — decimal number, Literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 3.14 }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for (0).toFixed(0) — zero value, Literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for (999).toFixed(0) — large integer, Literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 999 }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for result.toFixed(0) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'calc' }, arguments: [] }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.toFixed(0) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for (-1).toFixed(0) — negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message for toFixed(0) mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toMatch(/Unnecessary/)
    })

    test('report message for toFixed(0) is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toBe(
        'Unnecessary .toFixed(0) on an integer. This returns the same string as String(n) or n.toString().',
      )
    })

    test('report for toFixed(0) has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report for toFixed(0) has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report for toFixed(0) node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc for toFixed(0) preserves node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }], 7, 3, 7, 18))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (41) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x.toFixed(2) — non-zero Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(1) — Literal 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(5) — Literal 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(n) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(digits) — Identifier argument named digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Identifier', name: 'digits' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for (42).toString() — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for (42).toPrecision(0) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toPrecision', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toExponential(0) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toExponential', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(0, extra) — two arguments (length > 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(0, y, z) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'toFixed' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Literal', value: 'toFixed' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOFIXED" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'TOFIXED'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tofixed" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'tofixed'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('reports for x.toFixed(-0) — negative zero equals zero with ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: -0 }]))
      expect(reports.length).toBe(1)
    })

    test('does not report for x.toFixed(0.5) — Literal non-integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed("0") — StringLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(0 + 0) — BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 0 }, right: { type: 'Literal', value: 0 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(10) — larger argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(100) — very large argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(calc()) — CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'calc' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(obj.digits) — MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'digits' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x.toFixed(0.0) — Literal 0 as float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0.0 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberTofixedZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberTofixedZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'y' }, 'toFixed', [{ type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'z' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports for toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports for toFixed(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toString'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberTofixedZeroRule.create(context)
      const visitor2 = noUnnecessaryNumberTofixedZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberTofixedZeroRule.meta
      const meta2 = noUnnecessaryNumberTofixedZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
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
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
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
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberTofixedZeroRule).toBeDefined()
      expect(typeof noUnnecessaryNumberTofixedZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberTofixedZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toFixed', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property — toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'toFixed' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberTofixedZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Literal', value: 'toFixed' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

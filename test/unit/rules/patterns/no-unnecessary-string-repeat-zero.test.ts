import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringRepeatZeroRule } from '../../../../src/rules/patterns/no-unnecessary-string-repeat-zero.js'
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

function numLit(value: number): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-repeat-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning repeat', () => {
      const desc = noUnnecessaryStringRepeatZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/repeat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-repeat-zero.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringRepeatZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringRepeatZeroRule).toBeDefined()
      expect(noUnnecessaryStringRepeatZeroRule.meta).toBeDefined()
      expect(noUnnecessaryStringRepeatZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====


  describe('positive cases — reports .repeat(0)', () => {
    test('reports for "hello".repeat(0) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-character string .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'repeat', [numLit(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'repeat', [numLit(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for MemberExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for CallExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getString' }, arguments: [] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      expect(reports[0].message).toMatch(/repeat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      expect(reports[0].message).toBe(
        'Unnecessary .repeat(0). This always returns an empty string. Remove the call or use "" directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'repeat', [numLit(0)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'repeat', [numLit(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for chained method .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 's' }, property: { type: 'Identifier', name: 'trim' } }, arguments: [] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for LogicalExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 'fallback' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ParenthesizedExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ParenthesizedExpression', expression: { type: 'Literal', value: 'x' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for TaggedTemplateExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ArrayExpression', elements: [] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ObjectExpression', properties: [] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for UpdateExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Literal', value: 'b' }] },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for TypeCastExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'TypeCastExpression', expression: { type: 'Identifier', name: 'x' }, typeAnnotation: {} },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with computed: false MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [numLit(0)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'ThisExpression' },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for long string .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Literal', value: 'a very long string that goes on and on' },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for AwaitExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchString' }, arguments: [] } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for YieldExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'YieldExpression', argument: { type: 'Literal', value: 'yielded' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for AssignmentExpression object .repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'hello' } },
        'repeat',
        [numLit(0)],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for .repeat(1) — non-zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat(3) — positive non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(3)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat(n) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat(0, 1) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0), numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .padStart(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'padStart', [numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat(-1) — negative non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat(0.5) — fractional value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .repeat(100) — large non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(100)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .trim() — unrelated method with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .toString() — unrelated method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(0) — different method with zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'repeat' },
        arguments: [numLit(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [numLit(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [numLit(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Literal', value: 'repeat' },
        },
        arguments: [numLit(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Repeat" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'Repeat', [numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "repeats" (different method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeats', [numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0), numLit(1), numLit(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
        },
        arguments: [numLit(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: null,
        },
        arguments: [numLit(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [{ type: 'Identifier', name: 'count' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral "0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringRepeatZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryStringRepeatZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(1)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'repeat', [numLit(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [numLit(0)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [numLit(0)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'padStart', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'repeat', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(3)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringRepeatZeroRule.create(context)
      const visitor2 = noUnnecessaryStringRepeatZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringRepeatZeroRule.meta
      const meta2 = noUnnecessaryStringRepeatZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [numLit(0)],
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
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [numLit(0)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [numLit(0)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringRepeatZeroRule).toBeDefined()
      expect(typeof noUnnecessaryStringRepeatZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryStringRepeatZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [numLit(0)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'repeat', [numLit(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'repeat', [numLit(0)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

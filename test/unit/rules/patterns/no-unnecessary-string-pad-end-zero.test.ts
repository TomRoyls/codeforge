import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringPadEndZero } from '../../../../src/rules/patterns/no-unnecessary-string-pad-end-zero.js'
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

function makeNumericLiteral(value: number): unknown {
  return { type: 'NumericLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-pad-end-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringPadEndZero.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringPadEndZero.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringPadEndZero.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringPadEndZero.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringPadEndZero.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning padEnd', () => {
      const desc = noUnnecessaryStringPadEndZero.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/padend/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringPadEndZero.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-pad-end-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringPadEndZero.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringPadEndZero).toBeDefined()
      expect(noUnnecessaryStringPadEndZero.meta).toBeDefined()
      expect(noUnnecessaryStringPadEndZero.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary padEnd(0)', () => {
    test('reports for str.padEnd(0) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".padEnd(0) — Literal string object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions padEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports[0].message).toMatch(/padEnd/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(
        'String.prototype.padEnd(0) has no effect. The string length is unchanged.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('reports for fn().padEnd(0) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.padEnd(0) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for `template`.padEnd(0) — TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a ? b : c).padEnd(0) — ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for [arr].padEnd(0) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ({}).padEnd(0) — ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Foo().padEnd(0) — NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for (await promise).padEnd(0) — AwaitExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for (() => {}).padEnd(0) — ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for tag`tpl`.padEnd(0) — TaggedTemplateExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a, b).padEnd(0) — SequenceExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for TypeCastExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TypeCastExpression', expression: { type: 'Identifier', name: 'x' }, typeAnnotation: {} }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ParenthesizedExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'x' } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for this.padEnd(0) — ThisExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.padEnd(5) — positive value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padEnd(0, "x") — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0), { type: 'StringLiteral', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padEnd(x) — Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padEnd() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member str["padEnd"](0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
          computed: true,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is Literal (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "padstart" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padstart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Literal type (not NumericLiteral) with value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is StringLiteral with value "0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(100)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is UnaryExpression (e.g. -0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: makeNumericLiteral(0) }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0), { type: 'StringLiteral', value: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for four arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0), { type: 'StringLiteral', value: 'a' }, { type: 'StringLiteral', value: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'len' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "PadEnd" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'PadEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringPadEndZero.create(ctx1)
      const visitor2 = noUnnecessaryStringPadEndZero.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(5)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padEnd', [makeNumericLiteral(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(10)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringPadEndZero.create(context)
      const visitor2 = noUnnecessaryStringPadEndZero.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringPadEndZero.meta
      const meta2 = noUnnecessaryStringPadEndZero.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
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
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringPadEndZero).toBeDefined()
      expect(typeof noUnnecessaryStringPadEndZero.create).toBe('function')
      expect(typeof noUnnecessaryStringPadEndZero.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed=false member expression (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padEnd' },
          computed: false,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'padEnd' },
          computed: true,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadEndZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
